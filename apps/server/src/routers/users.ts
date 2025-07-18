import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
	analyticsEvents,
	comments,
	components,
	stars,
	tools,
	user,
	userSettings,
} from "../db/schema";
import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "../lib/trpc";
import {
	idSchema,
	updateUserSchema,
	updateUserSettingsSchema,
} from "../lib/validation";

export const usersRouter = router({
	// Get current user profile
	me: protectedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),

	// Update current user profile
	updateProfile: protectedProcedure
		.input(updateUserSchema)
		.mutation(async ({ ctx, input }) => {
			const [updatedUser] = await db
				.update(user)
				.set({ ...input, updatedAt: new Date() })
				.where(eq(user.id, ctx.user.id))
				.returning();

			return updatedUser;
		}),

	// Get user settings
	getSettings: protectedProcedure.query(async ({ ctx }) => {
		const settings = await db
			.select()
			.from(userSettings)
			.where(eq(userSettings.userId, ctx.user.id))
			.limit(1);

		return settings[0] || null;
	}),

	// Update user settings
	updateSettings: protectedProcedure
		.input(updateUserSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const [settings] = await db
				.insert(userSettings)
				.values({
					userId: ctx.user.id,
					...input,
				})
				.onConflictDoUpdate({
					target: userSettings.userId,
					set: input,
				})
				.returning();

			return settings;
		}),

	// Admin: Get all users
	getAll: adminProcedure.query(async () => {
		return await db.select().from(user);
	}),

	// Admin: Update user role
	updateRole: adminProcedure
		.input(
			idSchema.extend({
				role: z.enum(["user", "creator", "admin"]),
			}),
		)
		.mutation(async ({ input }) => {
			const [updatedUser] = await db
				.update(user)
				.set({ role: input.role, updatedAt: new Date() })
				.where(eq(user.id, input.id))
				.returning();

			return updatedUser;
		}),

	// Protected: Get user dashboard statistics
	getDashboard: protectedProcedure.query(async ({ ctx }) => {
		// Get user's starred items count
		const [starredComponentsCount] = await db
			.select({ count: count() })
			.from(stars)
			.where(
				and(eq(stars.userId, ctx.user.id), eq(stars.itemType, "component")),
			);

		const [starredToolsCount] = await db
			.select({ count: count() })
			.from(stars)
			.where(and(eq(stars.userId, ctx.user.id), eq(stars.itemType, "tool")));

		// Get user's comments count
		const [commentsCount] = await db
			.select({ count: count() })
			.from(comments)
			.where(eq(comments.userId, ctx.user.id));

		// Get user's created items count
		const [createdComponentsCount] = await db
			.select({ count: count() })
			.from(components)
			.where(eq(components.creatorId, ctx.user.id));

		const [createdToolsCount] = await db
			.select({ count: count() })
			.from(tools)
			.where(eq(tools.creatorId, ctx.user.id));

		// Get user's recent activity stats (last 30 days)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const [recentViews] = await db
			.select({ count: count() })
			.from(analyticsEvents)
			.where(
				and(
					eq(analyticsEvents.userId, ctx.user.id),
					eq(analyticsEvents.eventType, "view"),
					gte(analyticsEvents.createdAt, thirtyDaysAgo),
				),
			);

		return {
			starredComponents: starredComponentsCount.count,
			starredTools: starredToolsCount.count,
			totalStarred: starredComponentsCount.count + starredToolsCount.count,
			commentsCount: commentsCount.count,
			createdComponents: createdComponentsCount.count,
			createdTools: createdToolsCount.count,
			totalCreated: createdComponentsCount.count + createdToolsCount.count,
			recentViews: recentViews.count,
			downloadsCount: 0, // Placeholder for future implementation
		};
	}),

	// Protected: Get user activity feed
	getActivity: protectedProcedure
		.input(
			z.object({
				limit: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { limit } = input;

			// Get user's recent stars with item details
			const recentStars = await db
				.select({
					activityType: sql<"star">`'star'`,
					timestamp: stars.starredAt,
					itemType: stars.itemType,
					itemId: stars.itemId,
					content: sql<null>`null`,
					componentName: components.name,
					toolName: tools.name,
				})
				.from(stars)
				.leftJoin(
					components,
					and(eq(stars.itemId, components.id), eq(stars.itemType, "component")),
				)
				.leftJoin(
					tools,
					and(eq(stars.itemId, tools.id), eq(stars.itemType, "tool")),
				)
				.where(eq(stars.userId, ctx.user.id))
				.orderBy(desc(stars.starredAt))
				.limit(limit);

			// Get user's recent comments with item details
			const recentComments = await db
				.select({
					activityType: sql<"comment">`'comment'`,
					timestamp: comments.createdAt,
					itemType: comments.itemType,
					itemId: comments.itemId,
					content: comments.content,
					componentName: components.name,
					toolName: tools.name,
				})
				.from(comments)
				.leftJoin(
					components,
					and(
						eq(comments.itemId, components.id),
						eq(comments.itemType, "component"),
					),
				)
				.leftJoin(
					tools,
					and(eq(comments.itemId, tools.id), eq(comments.itemType, "tool")),
				)
				.where(eq(comments.userId, ctx.user.id))
				.orderBy(desc(comments.createdAt))
				.limit(limit);

			// Combine and sort all activities
			const allActivities = [...recentStars, ...recentComments]
				.sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				)
				.slice(0, limit);

			// Format the activities
			const formattedActivities = allActivities.map((activity, index) => ({
				id: `${activity.activityType}-${activity.itemId}-${index}`,
				type: activity.activityType,
				timestamp: activity.timestamp,
				createdAt: activity.timestamp, // Add createdAt alias
				itemType: activity.itemType,
				itemId: activity.itemId,
				content: activity.content,
				description: `${activity.activityType === "star" ? "Starred" : "Commented on"} ${activity.componentName || activity.toolName || "Unknown"}`,
				item: {
					id: activity.itemId,
					name: activity.componentName || activity.toolName || "Unknown",
					type: activity.itemType,
				},
			}));

			return formattedActivities.filter(
				(activity) => activity.item.name !== "Unknown",
			);
		}),
});
