import { count, desc, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { components, projects, stars, user } from "../db/schema";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

const usernameSchema = z.object({
	username: z.string().min(1),
});

const updateProfileSchema = z.object({
	bio: z.string().optional(),
	website: z.string().url().optional().or(z.literal("")),
	location: z.string().optional(),
	company: z.string().optional(),
	socialLinks: z.record(z.string(), z.string()).optional(),
	specialties: z.array(z.string()).optional(),
});

const searchCreatorsSchema = z.object({
	query: z.string().optional(),
	specialty: z.string().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(50).default(20),
});

export const creatorsRouter = router({
	// Public: Get creator profile by username
	getByUsername: publicProcedure
		.input(usernameSchema)
		.query(async ({ input }) => {
			const creator = await db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					bio: user.bio,
					website: user.website,
					location: user.location,
					company: user.company,
					socialLinks: user.socialLinks,
					verified: user.verified,
					specialties: user.specialties,
					image: user.image,
					createdAt: user.createdAt,
				})
				.from(user)
				.where(eq(user.username, input.username))
				.limit(1);

			if (!creator[0]) {
				throw new Error("Creator not found");
			}

			return creator[0];
		}),

	// Public: Get creator stats
	getStats: publicProcedure.input(usernameSchema).query(async ({ input }) => {
		const creator = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.username, input.username))
			.limit(1);

		if (!creator[0]) {
			throw new Error("Creator not found");
		}

		const creatorId = creator[0].id;

		// Get component count
		const componentCount = await db
			.select({ count: count() })
			.from(components)
			.where(eq(components.creatorId, creatorId));

		// Get project count
		const projectCount = await db
			.select({ count: count() })
			.from(projects)
			.where(eq(projects.userId, creatorId));

		// Get total stars received
		const totalStars = await db
			.select({ count: count() })
			.from(stars)
			.where(
				sql`${stars.itemType} = 'component' AND ${stars.itemId} IN (
						SELECT id FROM components WHERE creator_id = ${creatorId}
					)`,
			);

		return {
			componentCount: componentCount[0]?.count || 0,
			projectCount: projectCount[0]?.count || 0,
			totalStars: totalStars[0]?.count || 0,
		};
	}),

	// Public: Get creator's components
	getComponents: publicProcedure
		.input(
			usernameSchema.extend({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(12),
			}),
		)
		.query(async ({ input }) => {
			const { username, page, limit } = input;
			const offset = (page - 1) * limit;

			const creator = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.username, username))
				.limit(1);

			if (!creator[0]) {
				throw new Error("Creator not found");
			}

			const creatorComponents = await db
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
				})
				.from(components)
				.where(eq(components.creatorId, creator[0].id))
				.orderBy(desc(components.createdAt))
				.limit(limit)
				.offset(offset);

			// Get star counts for each component
			const componentsWithStats = await Promise.all(
				creatorComponents.map(async (component) => {
					const starCount = await db
						.select({ count: count() })
						.from(stars)
						.where(
							sql`${stars.itemType} = 'component' AND ${stars.itemId} = ${component.id}`,
						);

					return {
						...component,
						starsCount: starCount[0]?.count || 0,
					};
				}),
			);

			return componentsWithStats;
		}),

	// Public: Get creator's public projects
	getProjects: publicProcedure
		.input(
			usernameSchema.extend({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(12),
			}),
		)
		.query(async ({ input }) => {
			const { username, page, limit } = input;
			const offset = (page - 1) * limit;

			const creator = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.username, username))
				.limit(1);

			if (!creator[0]) {
				throw new Error("Creator not found");
			}

			const creatorProjects = await db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					slug: projects.slug,
					visibility: projects.visibility,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
				})
				.from(projects)
				.where(eq(projects.userId, creator[0].id))
				.orderBy(desc(projects.createdAt))
				.limit(limit)
				.offset(offset);

			// Only return public projects for public API
			return creatorProjects.filter(
				(project) => project.visibility === "public",
			);
		}),

	// Public: Search creators
	search: publicProcedure
		.input(searchCreatorsSchema)
		.query(async ({ input }) => {
			const { query, specialty, page, limit } = input;
			const offset = (page - 1) * limit;

			// Build base query
			let whereClause = sql`${user.username} IS NOT NULL`;

			if (query) {
				whereClause = sql`${whereClause} AND ${ilike(user.name, `%${query}%`)}`;
			}

			if (specialty) {
				whereClause = sql`${whereClause} AND ${user.specialties} @> ARRAY[${specialty}]::text[]`;
			}

			const creators = await db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					bio: user.bio,
					location: user.location,
					company: user.company,
					verified: user.verified,
					specialties: user.specialties,
					image: user.image,
					createdAt: user.createdAt,
				})
				.from(user)
				.where(whereClause)
				.orderBy(desc(user.createdAt))
				.limit(limit)
				.offset(offset);

			// Get stats for each creator
			const creatorsWithStats = await Promise.all(
				creators.map(async (creator) => {
					const componentCount = await db
						.select({ count: count() })
						.from(components)
						.where(eq(components.creatorId, creator.id));

					const totalStars = await db
						.select({ count: count() })
						.from(stars)
						.where(
							sql`${stars.itemType} = 'component' AND ${stars.itemId} IN (
								SELECT id FROM components WHERE creator_id = ${creator.id}
							)`,
						);

					return {
						...creator,
						componentCount: componentCount[0]?.count || 0,
						totalStars: totalStars[0]?.count || 0,
					};
				}),
			);

			return creatorsWithStats;
		}),

	// Public: Get trending creators
	getTrending: publicProcedure
		.input(
			z.object({
				period: z.enum(["week", "month", "all"]).default("month"),
				limit: z.number().min(1).max(20).default(10),
			}),
		)
		.query(async ({ input }) => {
			const { limit } = input;
			// For now, we'll use total stars as trending metric
			// In the future, this could be based on recent activity, new stars, etc.

			// Get creators with components first
			const creatorsWithComponents = await db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					bio: user.bio,
					location: user.location,
					verified: user.verified,
					image: user.image,
				})
				.from(user)
				.innerJoin(components, eq(components.creatorId, user.id))
				.where(sql`${user.username} IS NOT NULL`)
				.groupBy(
					user.id,
					user.name,
					user.username,
					user.bio,
					user.location,
					user.verified,
					user.image,
				)
				.limit(limit * 2); // Get more to filter by stars

			// Calculate stars and component count for each creator
			const trending = await Promise.all(
				creatorsWithComponents.map(async (creator) => {
					const starCount = await db
						.select({ count: count() })
						.from(stars)
						.where(
							sql`${stars.itemType} = 'component' AND ${stars.itemId} IN (
								SELECT id FROM components WHERE creator_id = ${creator.id}
							)`,
						);

					const componentCount = await db
						.select({ count: count() })
						.from(components)
						.where(eq(components.creatorId, creator.id));

					return {
						...creator,
						totalStars: starCount[0]?.count || 0,
						componentCount: componentCount[0]?.count || 0,
					};
				}),
			);

			// Sort by stars and limit
			const sortedTrending = trending
				.sort((a, b) => b.totalStars - a.totalStars)
				.slice(0, limit);

			return sortedTrending;
		}),

	// Protected: Update current user's profile
	updateProfile: protectedProcedure
		.input(updateProfileSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user.id;

			const updatedUser = await db
				.update(user)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(user.id, userId))
				.returning({
					id: user.id,
					name: user.name,
					username: user.username,
					bio: user.bio,
					website: user.website,
					location: user.location,
					company: user.company,
					socialLinks: user.socialLinks,
					specialties: user.specialties,
					verified: user.verified,
					image: user.image,
				});

			return updatedUser[0];
		}),

	// Protected: Get current user's full profile
	getMyProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.user.id;

		const profile = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				username: user.username,
				bio: user.bio,
				website: user.website,
				location: user.location,
				company: user.company,
				socialLinks: user.socialLinks,
				specialties: user.specialties,
				verified: user.verified,
				image: user.image,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			})
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		return profile[0];
	}),
});
