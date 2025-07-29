import { and, asc, avg, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
	categories,
	comments,
	componentCategories,
	components,
	githubCache,
	ratings,
	stars,
	user,
} from "../db/schema";
import {
	creatorProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "../lib/trpc";
import {
	createCommentSchema,
	createComponentSchema,
	getByIdsSchema,
	idSchema,
	rateItemSchema,
	searchSchema,
	starItemSchema,
	updateComponentSchema,
} from "../lib/validation";

// Helper function to get GitHub data from cache
async function getGitHubDataFromCache(repoUrl: string | null) {
	if (!repoUrl) return null;
	
	try {
		const cached = await db
			.select()
			.from(githubCache)
			.where(eq(githubCache.repoUrl, repoUrl))
			.limit(1);

		if (cached[0]) {
			let data;
			try {
				data = JSON.parse(cached[0].data);
			} catch (parseError) {
				console.error('Error parsing cached GitHub data for', repoUrl, ':', parseError);
				return null;
			}
			
			// Validate that data is an object
			if (!data || typeof data !== 'object') {
				console.error('Invalid cached GitHub data format for', repoUrl);
				return null;
			}
			
			return {
				readme: data.readme || null,
				stars: data.stargazers_count || data.stars || 0,
				forks: data.forks_count || data.forks || 0,
				issues: data.open_issues_count || data.issues || 0,
				watchers: data.watchers_count || data.watchers || 0,
				language: data.language || null,
				lastCommit: data.lastCommit || data.updated_at || null,
			};
		}
	} catch (dbError) {
		console.error('Database error fetching GitHub data from cache for', repoUrl, ':', dbError);
	}
	
	return null;
}

export const componentsRouter = router({
	// Public: Get all components with filters and pagination
	getAll: publicProcedure.input(searchSchema).query(async ({ input }) => {
		const { query, categoryId, page, limit, sort = "createdAt", order = "desc" } = input;
		const offset = (page - 1) * limit;

		// Build WHERE conditions
		const whereConditions = [];

		if (query) {
			whereConditions.push(
				or(
					ilike(components.name, `%${query}%`),
					ilike(components.description, `%${query}%`),
				),
			);
		}

		if (categoryId) {
			// Get component IDs that belong to this category
			const componentIdsInCategory = db
				.select({ componentId: componentCategories.componentId })
				.from(componentCategories)
				.where(eq(componentCategories.categoryId, categoryId));

			whereConditions.push(inArray(components.id, componentIdsInCategory));
		}

		const baseComponentsQuery = db
			.select({
				id: components.id,
				name: components.name,
				description: components.description,
				repoUrl: components.repoUrl,
				websiteUrl: components.websiteUrl,
				installUrl: components.installUrl,
				installCommand: components.installCommand,
				tags: components.tags,
				status: components.status,
				createdAt: components.createdAt,
				updatedAt: components.updatedAt,
				creator: {
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				},
			})
			.from(components)
			.leftJoin(user, eq(components.creatorId, user.id))
			.limit(limit)
			.offset(offset)
			.orderBy(
				sort === "name" ? (order === "asc" ? asc(components.name) : desc(components.name)) :
				sort === "updatedAt" ? (order === "asc" ? asc(components.updatedAt) : desc(components.updatedAt)) :
				order === "asc" ? asc(components.createdAt) : desc(components.createdAt)
			);

		const results =
			whereConditions.length > 0
				? await baseComponentsQuery.where(
						whereConditions.length === 1
							? whereConditions[0]
							: and(...whereConditions),
					)
				: await baseComponentsQuery;

		// Get categories and stats for each component
		const componentsWithDetails = await Promise.all(
			results.map(async (component) => {
				// Get categories
				const componentCategoriesData = await db
					.select({ category: categories })
					.from(componentCategories)
					.leftJoin(
						categories,
						eq(componentCategories.categoryId, categories.id),
					)
					.where(eq(componentCategories.componentId, component.id));

				// Get stats
				const [starsCount] = await db
					.select({ count: count() })
					.from(stars)
					.where(
						and(
							eq(stars.itemType, "component"),
							eq(stars.itemId, component.id),
						),
					);

				// Get GitHub data from cache
				const githubData = await getGitHubDataFromCache(component.repoUrl);

				return {
					...component,
					categories: componentCategoriesData
						.map((cc) => cc.category)
						.filter(Boolean),
					starsCount: githubData?.stars ?? 0,
					githubUrl: component.repoUrl,
					isStarred: false, // Will be updated in protected queries
					forksCount: githubData?.forks ?? 0,
					issuesCount: githubData?.issues ?? 0,
					watchersCount: githubData?.watchers ?? 0,
					readme: githubData?.readme || null,
					exampleCode: null,
					previewUrl: null,
				};
			}),
		);

		// Get total count
		const baseTotalCountQuery = db.select({ count: count() }).from(components);

		const [{ count: totalCount }] =
			whereConditions.length > 0
				? await baseTotalCountQuery.where(
						whereConditions.length === 1
							? whereConditions[0]
							: and(...whereConditions),
					)
				: await baseTotalCountQuery;

		return {
			components: componentsWithDetails,
			totalCount,
			totalPages: Math.ceil(totalCount / limit),
			currentPage: page,
		};
	}),

	// Public: Get component by ID with detailed info
	getById: publicProcedure.input(idSchema).query(async ({ ctx, input }) => {
		const component = await db
			.select({
				id: components.id,
				name: components.name,
				description: components.description,
				repoUrl: components.repoUrl,
				websiteUrl: components.websiteUrl,
				installUrl: components.installUrl,
				installCommand: components.installCommand,
				tags: components.tags,
				status: components.status,
				createdAt: components.createdAt,
				updatedAt: components.updatedAt,
				creator: {
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				},
			})
			.from(components)
			.leftJoin(user, eq(components.creatorId, user.id))
			.where(eq(components.id, input.id))
			.limit(1);

		if (!component[0]) {
			throw new Error("Component not found");
		}

		// Get categories
		const componentCategoriesData = await db
			.select({ category: categories })
			.from(componentCategories)
			.leftJoin(categories, eq(componentCategories.categoryId, categories.id))
			.where(eq(componentCategories.componentId, input.id));

		// Get stats
		const [starsCount] = await db
			.select({ count: count() })
			.from(stars)
			.where(and(eq(stars.itemType, "component"), eq(stars.itemId, input.id)));

		const [avgRating] = await db
			.select({ average: avg(ratings.rating) })
			.from(ratings)
			.where(
				and(eq(ratings.itemType, "component"), eq(ratings.itemId, input.id)),
			);

		// Check if current user has starred this component (if authenticated)
		let isStarred = false;
		if (ctx?.session?.user?.id) {
			const [userStar] = await db
				.select()
				.from(stars)
				.where(
					and(
						eq(stars.userId, ctx.session.user.id),
						eq(stars.itemType, "component"),
						eq(stars.itemId, input.id),
					),
				)
				.limit(1);
			isStarred = !!userStar;
		}

		// Get GitHub data from cache
		const githubData = await getGitHubDataFromCache(component[0].repoUrl);

		return {
			...component[0],
			categories: componentCategoriesData
				.map((cc) => cc.category)
				.filter(Boolean),
			starsCount: starsCount.count,
			averageRating: avgRating.average
				? Number.parseFloat(avgRating.average)
				: null,
			githubUrl: component[0].repoUrl,
			isStarred,
			githubStarsCount: githubData?.stars ?? 0,
			forksCount: githubData?.forks ?? 0,
			issuesCount: githubData?.issues ?? 0,
			watchersCount: githubData?.watchers ?? 0,
			readme: githubData?.readme || null,
			exampleCode: null,
			previewUrl: null,
		};
	}),

	// Creator: Create component
	create: creatorProcedure
		.input(createComponentSchema)
		.mutation(async ({ ctx, input }) => {
			const { categoryIds, ...componentData } = input;

			const [newComponent] = await db
				.insert(components)
				.values({
					...componentData,
					creatorId: ctx.user.id,
				})
				.returning();

			// Add categories if provided
			if (categoryIds && categoryIds.length > 0) {
				await db.insert(componentCategories).values(
					categoryIds.map((categoryId) => ({
						componentId: newComponent.id,
						categoryId,
					})),
				);
			}

			return newComponent;
		}),

	// Creator/Admin: Update component
	update: protectedProcedure
		.input(idSchema.extend(updateComponentSchema.shape))
		.mutation(async ({ ctx, input }) => {
			const { id, categoryIds, ...updateData } = input;

			// Check if user owns component or is admin
			const component = await db
				.select()
				.from(components)
				.where(eq(components.id, id))
				.limit(1);

			if (!component[0]) {
				throw new Error("Component not found");
			}

			if (component[0].creatorId !== ctx.user.id && ctx.user.role !== "admin") {
				throw new Error("Forbidden: You can only edit your own components");
			}

			const [updatedComponent] = await db
				.update(components)
				.set({ ...updateData, updatedAt: new Date() })
				.where(eq(components.id, id))
				.returning();

			// Update categories if provided
			if (categoryIds) {
				await db
					.delete(componentCategories)
					.where(eq(componentCategories.componentId, id));
				if (categoryIds.length > 0) {
					await db.insert(componentCategories).values(
						categoryIds.map((categoryId) => ({
							componentId: id,
							categoryId,
						})),
					);
				}
			}

			return updatedComponent;
		}),

	// Creator/Admin: Delete component
	delete: protectedProcedure
		.input(idSchema)
		.mutation(async ({ ctx, input }) => {
			const component = await db
				.select()
				.from(components)
				.where(eq(components.id, input.id))
				.limit(1);

			if (!component[0]) {
				throw new Error("Component not found");
			}

			if (component[0].creatorId !== ctx.user.id && ctx.user.role !== "admin") {
				throw new Error("Forbidden: You can only delete your own components");
			}

			await db.delete(components).where(eq(components.id, input.id));
			return { success: true };
		}),

	// Protected: Star/unstar component
	toggleStar: protectedProcedure
		.input(starItemSchema.omit({ itemType: true }))
		.mutation(async ({ ctx, input }) => {
			const existingStar = await db
				.select()
				.from(stars)
				.where(
					and(
						eq(stars.userId, ctx.user.id),
						eq(stars.itemType, "component"),
						eq(stars.itemId, input.itemId),
					),
				)
				.limit(1);

			if (existingStar[0]) {
				// Unstar
				await db
					.delete(stars)
					.where(
						and(
							eq(stars.userId, ctx.user.id),
							eq(stars.itemType, "component"),
							eq(stars.itemId, input.itemId),
						),
					);
				return { starred: false };
			}
			// Star
			await db.insert(stars).values({
				userId: ctx.user.id,
				itemType: "component",
				itemId: input.itemId,
			});
			return { starred: true };
		}),

	// Protected: Rate component
	rate: protectedProcedure
		.input(rateItemSchema.omit({ itemType: true }))
		.mutation(async ({ ctx, input }) => {
			const [rating] = await db
				.insert(ratings)
				.values({
					userId: ctx.user.id,
					itemType: "component",
					itemId: input.itemId,
					rating: input.rating,
				})
				.onConflictDoUpdate({
					target: [ratings.userId, ratings.itemType, ratings.itemId],
					set: { rating: input.rating, ratedAt: new Date() },
				})
				.returning();

			return rating;
		}),

	// Protected: Add comment
	addComment: protectedProcedure
		.input(createCommentSchema.omit({ itemType: true }))
		.mutation(async ({ ctx, input }) => {
			const [comment] = await db
				.insert(comments)
				.values({
					userId: ctx.user.id,
					itemType: "component",
					itemId: input.itemId,
					content: input.content,
					parentId: input.parentId,
				})
				.returning();

			return comment;
		}),

	// Public: Get comments for component
	getComments: publicProcedure.input(idSchema).query(async ({ input }) => {
		const componentComments = await db
			.select({
				id: comments.id,
				content: comments.content,
				createdAt: comments.createdAt,
				parentId: comments.parentId,
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				},
			})
			.from(comments)
			.leftJoin(user, eq(comments.userId, user.id))
			.where(
				and(eq(comments.itemType, "component"), eq(comments.itemId, input.id)),
			)
			.orderBy(desc(comments.createdAt));

		return componentComments;
	}),

	// Protected: Get user's starred components
	getStarred: protectedProcedure
		.input(
			z.object({
				limit: z.number().int().min(1).max(100).default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { limit } = input;

			const starredComponents = await db
				.select({
					id: components.id,
					name: components.name,
					description: components.description,
					repoUrl: components.repoUrl,
					websiteUrl: components.websiteUrl,
					installUrl: components.installUrl,
					installCommand: components.installCommand,
					tags: components.tags,
					status: components.status,
					createdAt: components.createdAt,
					updatedAt: components.updatedAt,
					starredAt: stars.starredAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(stars)
				.innerJoin(components, eq(stars.itemId, components.id))
				.leftJoin(user, eq(components.creatorId, user.id))
				.where(
					and(eq(stars.userId, ctx.user.id), eq(stars.itemType, "component")),
				)
				.orderBy(desc(stars.starredAt))
				.limit(limit);

			// Get categories and stats for each component
			const componentsWithDetails = await Promise.all(
				starredComponents.map(async (component) => {
					// Get categories
					const componentCategoriesData = await db
						.select({ category: categories })
						.from(componentCategories)
						.leftJoin(
							categories,
							eq(componentCategories.categoryId, categories.id),
						)
						.where(eq(componentCategories.componentId, component.id));

					// Get stats
					const [starsCount] = await db
						.select({ count: count() })
						.from(stars)
						.where(
							and(
								eq(stars.itemType, "component"),
								eq(stars.itemId, component.id),
							),
						);

					// Get GitHub data from cache
					const githubData = await getGitHubDataFromCache(component.repoUrl);

					return {
						...component,
						categories: componentCategoriesData
							.map((cc) => cc.category)
							.filter(Boolean),
						starsCount: starsCount.count,
						githubUrl: component.repoUrl,
						isStarred: false, // Will be updated in protected queries
						forksCount: githubData?.forks ?? 0,
						issuesCount: githubData?.issues ?? 0,
						watchersCount: githubData?.watchers ?? 0,
						readme: githubData?.readme || null,
						exampleCode: null,
						previewUrl: null,
					};
				}),
			);

			return componentsWithDetails;
		}),

	// Public: Get components by IDs (for cart functionality)
	getByIds: publicProcedure.input(getByIdsSchema).query(async ({ input }) => {
		const { ids } = input;

		if (ids.length === 0) {
			return [];
		}

		const results = await db
			.select({
				id: components.id,
				name: components.name,
				description: components.description,
				repoUrl: components.repoUrl,
				websiteUrl: components.websiteUrl,
				installUrl: components.installUrl,
				installCommand: components.installCommand,
				tags: components.tags,
				status: components.status,
				createdAt: components.createdAt,
				updatedAt: components.updatedAt,
				creator: {
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				},
			})
			.from(components)
			.leftJoin(user, eq(components.creatorId, user.id))
			.where(inArray(components.id, ids))
			.orderBy(desc(components.createdAt));

		// Get categories and stats for each component
		const componentsWithDetails = await Promise.all(
			results.map(async (component) => {
				// Get categories
				const componentCategoriesData = await db
					.select({ category: categories })
					.from(componentCategories)
					.leftJoin(
						categories,
						eq(componentCategories.categoryId, categories.id),
					)
					.where(eq(componentCategories.componentId, component.id));

				// Get stats
				const [starsCount] = await db
					.select({ count: count() })
					.from(stars)
					.where(
						and(
							eq(stars.itemType, "component"),
							eq(stars.itemId, component.id),
						),
					);

				// Get GitHub data from cache
				const githubData = await getGitHubDataFromCache(component.repoUrl);

				return {
					...component,
					categories: componentCategoriesData
						.map((cc) => cc.category)
						.filter(Boolean),
					starsCount: starsCount.count,
					githubUrl: component.repoUrl,
					isStarred: false,
					forksCount: githubData?.forks ?? 0,
					issuesCount: githubData?.issues ?? 0,
					watchersCount: githubData?.watchers ?? 0,
					readme: githubData?.readme || null,
					exampleCode: null,
					previewUrl: null,
				};
			}),
		);

		return componentsWithDetails;
	}),
});
