import { z } from "zod";
import { router, publicProcedure, protectedProcedure, creatorProcedure } from "../lib/trpc";
import { db } from "../db";
import { components, componentCategories, categories, user, stars, ratings, comments } from "../db/schema";
import { eq, and, ilike, count, avg, desc, sql, or, inArray } from "drizzle-orm";
import { 
	createComponentSchema, 
	updateComponentSchema, 
	idSchema, 
	searchSchema,
	starItemSchema,
	rateItemSchema,
	createCommentSchema 
} from "../lib/validation";

export const componentsRouter = router({
	// Public: Get all components with filters and pagination
	getAll: publicProcedure
		.input(searchSchema)
		.query(async ({ input }) => {
			const { query, categoryId, page, limit } = input;
			const offset = (page - 1) * limit;

			// Build WHERE conditions
			const whereConditions = [];
			
			if (query) {
				whereConditions.push(
					or(
						ilike(components.name, `%${query}%`),
						ilike(components.description, `%${query}%`)
					)
				);
			}

			if (categoryId) {
				// Get component IDs that belong to this category
				const componentIdsInCategory = db
					.select({ componentId: componentCategories.componentId })
					.from(componentCategories)
					.where(eq(componentCategories.categoryId, categoryId));
				
				whereConditions.push(
					inArray(components.id, componentIdsInCategory)
				);
			}

			const baseComponentsQuery = db
				.select({
					id: components.id,
					name: components.name,
					description: components.description,
					repoUrl: components.repoUrl,
					websiteUrl: components.websiteUrl,
					installUrl: components.installUrl,
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
				.orderBy(desc(components.createdAt));

			const results = whereConditions.length > 0
				? await baseComponentsQuery.where(
					whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
				)
				: await baseComponentsQuery;
			
			// Get total count
			const baseTotalCountQuery = db
				.select({ count: count() })
				.from(components);
			
			const [{ count: totalCount }] = whereConditions.length > 0
				? await baseTotalCountQuery.where(
					whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
				)
				: await baseTotalCountQuery;

			return {
				components: results,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),

	// Public: Get component by ID with detailed info
	getById: publicProcedure
		.input(idSchema)
		.query(async ({ input }) => {
			const component = await db
				.select({
					id: components.id,
					name: components.name,
					description: components.description,
					repoUrl: components.repoUrl,
					websiteUrl: components.websiteUrl,
					installUrl: components.installUrl,
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
			const componentCategories = await db
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
				.where(and(eq(ratings.itemType, "component"), eq(ratings.itemId, input.id)));

			return {
				...component[0],
				categories: componentCategories.map(cc => cc.category).filter(Boolean),
				starsCount: starsCount.count,
				averageRating: avgRating.average ? parseFloat(avgRating.average) : null,
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
					categoryIds.map(categoryId => ({
						componentId: newComponent.id,
						categoryId,
					}))
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
				await db.delete(componentCategories).where(eq(componentCategories.componentId, id));
				if (categoryIds.length > 0) {
					await db.insert(componentCategories).values(
						categoryIds.map(categoryId => ({
							componentId: id,
							categoryId,
						}))
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
						eq(stars.itemId, input.itemId)
					)
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
							eq(stars.itemId, input.itemId)
						)
					);
				return { starred: false };
			} else {
				// Star
				await db.insert(stars).values({
					userId: ctx.user.id,
					itemType: "component",
					itemId: input.itemId,
				});
				return { starred: true };
			}
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
	getComments: publicProcedure
		.input(idSchema)
		.query(async ({ input }) => {
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
					and(
						eq(comments.itemType, "component"),
						eq(comments.itemId, input.id)
					)
				)
				.orderBy(desc(comments.createdAt));

			return componentComments;
		}),
});