import { z } from "zod";
import { router, publicProcedure, protectedProcedure, creatorProcedure } from "../lib/trpc";
import { db } from "../db";
import { tools, toolCategories, categories, user, stars, ratings, comments } from "../db/schema";
import { eq, and, ilike, count, avg, desc, sql, or, inArray } from "drizzle-orm";
import { 
	createToolSchema, 
	updateToolSchema, 
	idSchema, 
	searchSchema,
	starItemSchema,
	rateItemSchema,
	createCommentSchema 
} from "../lib/validation";

export const toolsRouter = router({
	// Public: Get all tools with filters and pagination
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
						ilike(tools.name, `%${query}%`),
						ilike(tools.description, `%${query}%`)
					)
				);
			}

			if (categoryId) {
				// Get tool IDs that belong to this category
				const toolIdsInCategory = db
					.select({ toolId: toolCategories.toolId })
					.from(toolCategories)
					.where(eq(toolCategories.categoryId, categoryId));
				
				whereConditions.push(
					inArray(tools.id, toolIdsInCategory)
				);
			}

			const baseToolsQuery = db
				.select({
					id: tools.id,
					name: tools.name,
					description: tools.description,
					repoUrl: tools.repoUrl,
					websiteUrl: tools.websiteUrl,
					installUrl: tools.installUrl,
					createdAt: tools.createdAt,
					updatedAt: tools.updatedAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(tools)
				.leftJoin(user, eq(tools.creatorId, user.id))
				.limit(limit)
				.offset(offset)
				.orderBy(desc(tools.createdAt));

			const results = whereConditions.length > 0
				? await baseToolsQuery.where(
					whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
				)
				: await baseToolsQuery;
			
			// Get total count
			const baseTotalCountQuery = db
				.select({ count: count() })
				.from(tools);
			
			const [{ count: totalCount }] = whereConditions.length > 0
				? await baseTotalCountQuery.where(
					whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
				)
				: await baseTotalCountQuery;

			return {
				tools: results,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),

	// Public: Get tool by ID with detailed info
	getById: publicProcedure
		.input(idSchema)
		.query(async ({ input }) => {
			const tool = await db
				.select({
					id: tools.id,
					name: tools.name,
					description: tools.description,
					repoUrl: tools.repoUrl,
					websiteUrl: tools.websiteUrl,
					installUrl: tools.installUrl,
					createdAt: tools.createdAt,
					updatedAt: tools.updatedAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(tools)
				.leftJoin(user, eq(tools.creatorId, user.id))
				.where(eq(tools.id, input.id))
				.limit(1);

			if (!tool[0]) {
				throw new Error("Tool not found");
			}

			// Get categories
			const toolCategoriesResult = await db
				.select({ category: categories })
				.from(toolCategories)
				.leftJoin(categories, eq(toolCategories.categoryId, categories.id))
				.where(eq(toolCategories.toolId, input.id));

			// Get stats
			const [starsCount] = await db
				.select({ count: count() })
				.from(stars)
				.where(and(eq(stars.itemType, "tool"), eq(stars.itemId, input.id)));

			const [avgRating] = await db
				.select({ average: avg(ratings.rating) })
				.from(ratings)
				.where(and(eq(ratings.itemType, "tool"), eq(ratings.itemId, input.id)));

			return {
				...tool[0],
				categories: toolCategoriesResult.map(tc => tc.category).filter(Boolean),
				starsCount: starsCount.count,
				averageRating: avgRating.average ? parseFloat(avgRating.average) : null,
			};
		}),

	// Creator: Create tool
	create: creatorProcedure
		.input(createToolSchema)
		.mutation(async ({ ctx, input }) => {
			const { categoryIds, ...toolData } = input;

			const [newTool] = await db
				.insert(tools)
				.values({
					...toolData,
					creatorId: ctx.user.id,
				})
				.returning();

			// Add categories if provided
			if (categoryIds && categoryIds.length > 0) {
				await db.insert(toolCategories).values(
					categoryIds.map(categoryId => ({
						toolId: newTool.id,
						categoryId,
					}))
				);
			}

			return newTool;
		}),

	// Creator/Admin: Update tool
	update: protectedProcedure
		.input(idSchema.extend(updateToolSchema.shape))
		.mutation(async ({ ctx, input }) => {
			const { id, categoryIds, ...updateData } = input;

			// Check if user owns tool or is admin
			const tool = await db
				.select()
				.from(tools)
				.where(eq(tools.id, id))
				.limit(1);

			if (!tool[0]) {
				throw new Error("Tool not found");
			}

			if (tool[0].creatorId !== ctx.user.id && ctx.user.role !== "admin") {
				throw new Error("Forbidden: You can only edit your own tools");
			}

			const [updatedTool] = await db
				.update(tools)
				.set({ ...updateData, updatedAt: new Date() })
				.where(eq(tools.id, id))
				.returning();

			// Update categories if provided
			if (categoryIds) {
				await db.delete(toolCategories).where(eq(toolCategories.toolId, id));
				if (categoryIds.length > 0) {
					await db.insert(toolCategories).values(
						categoryIds.map(categoryId => ({
							toolId: id,
							categoryId,
						}))
					);
				}
			}

			return updatedTool;
		}),

	// Creator/Admin: Delete tool
	delete: protectedProcedure
		.input(idSchema)
		.mutation(async ({ ctx, input }) => {
			const tool = await db
				.select()
				.from(tools)
				.where(eq(tools.id, input.id))
				.limit(1);

			if (!tool[0]) {
				throw new Error("Tool not found");
			}

			if (tool[0].creatorId !== ctx.user.id && ctx.user.role !== "admin") {
				throw new Error("Forbidden: You can only delete your own tools");
			}

			await db.delete(tools).where(eq(tools.id, input.id));
			return { success: true };
		}),

	// Protected: Star/unstar tool
	toggleStar: protectedProcedure
		.input(starItemSchema.omit({ itemType: true }))
		.mutation(async ({ ctx, input }) => {
			const existingStar = await db
				.select()
				.from(stars)
				.where(
					and(
						eq(stars.userId, ctx.user.id),
						eq(stars.itemType, "tool"),
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
							eq(stars.itemType, "tool"),
							eq(stars.itemId, input.itemId)
						)
					);
				return { starred: false };
			} else {
				// Star
				await db.insert(stars).values({
					userId: ctx.user.id,
					itemType: "tool",
					itemId: input.itemId,
				});
				return { starred: true };
			}
		}),

	// Protected: Rate tool
	rate: protectedProcedure
		.input(rateItemSchema.omit({ itemType: true }))
		.mutation(async ({ ctx, input }) => {
			const [rating] = await db
				.insert(ratings)
				.values({
					userId: ctx.user.id,
					itemType: "tool",
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
					itemType: "tool",
					itemId: input.itemId,
					content: input.content,
					parentId: input.parentId,
				})
				.returning();

			return comment;
		}),

	// Public: Get comments for tool
	getComments: publicProcedure
		.input(idSchema)
		.query(async ({ input }) => {
			const toolComments = await db
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
						eq(comments.itemType, "tool"),
						eq(comments.itemId, input.id)
					)
				)
				.orderBy(desc(comments.createdAt));

			return toolComments;
		}),
});