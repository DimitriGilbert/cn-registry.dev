import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../lib/trpc";
import { db } from "../db";
import { analyticsEvents, countersCache, components, tools } from "../db/schema";
import { eq, and, desc, sql, gt, gte } from "drizzle-orm";
import { trackEventSchema, idSchema } from "../lib/validation";

export const analyticsRouter = router({
	// Public/Protected: Track event
	trackEvent: publicProcedure
		.input(trackEventSchema)
		.mutation(async ({ ctx, input }) => {
			const [event] = await db
				.insert(analyticsEvents)
				.values({
					...input,
					userId: ctx?.session?.user?.id || null,
				})
				.returning();

			return event;
		}),

	// Public: Get trending components/tools
	getTrending: publicProcedure
		.input(z.object({
			itemType: z.enum(["component", "tool"]).optional(),
			period: z.enum(["day", "week", "month"]).default("week"),
			limit: z.number().int().min(1).max(50).default(10),
		}))
		.query(async ({ input }) => {
			const { itemType, period, limit } = input;
			
			// Calculate date threshold
			const now = new Date();
			const daysAgo = period === "day" ? 1 : period === "week" ? 7 : 30;
			const threshold = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

			let baseQuery = db
				.select({
					itemId: analyticsEvents.itemId,
					itemType: analyticsEvents.itemType,
					eventCount: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(gte(analyticsEvents.createdAt, threshold))
				.groupBy(analyticsEvents.itemId, analyticsEvents.itemType)
				.orderBy(desc(sql`count(*)`))
				.limit(limit);

			if (itemType) {
				baseQuery = baseQuery.where(eq(analyticsEvents.itemType, itemType));
			}

			const trending = await baseQuery;

			// Get detailed info for each trending item
			const detailedResults = await Promise.all(
				trending.map(async (item) => {
					if (item.itemType === "component") {
						const component = await db
							.select()
							.from(components)
							.where(eq(components.id, item.itemId))
							.limit(1);
						return {
							...item,
							details: component[0] || null,
						};
					} else {
						const tool = await db
							.select()
							.from(tools)
							.where(eq(tools.id, item.itemId))
							.limit(1);
						return {
							...item,
							details: tool[0] || null,
						};
					}
				})
			);

			return detailedResults.filter(item => item.details !== null);
		}),

	// Admin: Get analytics summary
	getSummary: adminProcedure
		.input(z.object({
			startDate: z.string().optional(),
			endDate: z.string().optional(),
		}))
		.query(async ({ input }) => {
			const { startDate, endDate } = input;
			
			let whereClause = sql`1=1`;
			
			if (startDate) {
				whereClause = sql`${whereClause} AND ${analyticsEvents.createdAt} >= ${startDate}`;
			}
			
			if (endDate) {
				whereClause = sql`${whereClause} AND ${analyticsEvents.createdAt} <= ${endDate}`;
			}

			// Get event counts by type
			const eventCounts = await db
				.select({
					eventType: analyticsEvents.eventType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(whereClause)
				.groupBy(analyticsEvents.eventType);

			// Get item type distribution
			const itemTypeDistribution = await db
				.select({
					itemType: analyticsEvents.itemType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(whereClause)
				.groupBy(analyticsEvents.itemType);

			// Get daily event counts for the last 30 days
			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
			const dailyStats = await db
				.select({
					date: sql<string>`DATE(${analyticsEvents.createdAt})`,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(gte(analyticsEvents.createdAt, thirtyDaysAgo))
				.groupBy(sql`DATE(${analyticsEvents.createdAt})`)
				.orderBy(sql`DATE(${analyticsEvents.createdAt})`);

			return {
				eventCounts,
				itemTypeDistribution,
				dailyStats,
			};
		}),

	// Admin: Get detailed analytics for specific item
	getItemAnalytics: adminProcedure
		.input(z.object({
			itemId: z.string().uuid(),
			itemType: z.enum(["component", "tool"]),
			period: z.enum(["day", "week", "month"]).default("month"),
		}))
		.query(async ({ input }) => {
			const { itemId, itemType, period } = input;
			
			const daysAgo = period === "day" ? 1 : period === "week" ? 7 : 30;
			const threshold = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

			// Get events by type for this item
			const eventsByType = await db
				.select({
					eventType: analyticsEvents.eventType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, itemId),
						eq(analyticsEvents.itemType, itemType),
						gte(analyticsEvents.createdAt, threshold)
					)
				)
				.groupBy(analyticsEvents.eventType);

			// Get daily breakdown
			const dailyBreakdown = await db
				.select({
					date: sql<string>`DATE(${analyticsEvents.createdAt})`,
					eventType: analyticsEvents.eventType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, itemId),
						eq(analyticsEvents.itemType, itemType),
						gte(analyticsEvents.createdAt, threshold)
					)
				)
				.groupBy(sql`DATE(${analyticsEvents.createdAt})`, analyticsEvents.eventType)
				.orderBy(sql`DATE(${analyticsEvents.createdAt})`);

			return {
				eventsByType,
				dailyBreakdown,
			};
		}),
});