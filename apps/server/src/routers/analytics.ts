import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
	analyticsEvents,
	comments,
	components,
	stars,
	tools,
	user,
} from "../db/schema";
import { adminProcedure, publicProcedure, router } from "../lib/trpc";
import { trackEventSchema } from "../lib/validation";

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
					referrer: input.referrer || null,
					userAgent: input.userAgent || null,
				})
				.returning();

			return event;
		}),

	// Public: Get trending components/tools
	getTrending: publicProcedure
		.input(
			z.object({
				itemType: z.enum(["component", "tool"]).optional(),
				period: z.enum(["day", "week", "month"]).default("week"),
				limit: z.number().int().min(1).max(50).default(10),
			}),
		)
		.query(async ({ input }) => {
			const { itemType, period, limit } = input;

			// Calculate date threshold
			const now = new Date();
			const daysAgo = period === "day" ? 1 : period === "week" ? 7 : 30;
			const threshold = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

			const baseQuery = db
				.select({
					itemId: analyticsEvents.itemId,
					itemType: analyticsEvents.itemType,
					eventCount: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					itemType
						? and(
								gte(analyticsEvents.createdAt, threshold),
								eq(analyticsEvents.itemType, itemType),
							)
						: gte(analyticsEvents.createdAt, threshold),
				)
				.groupBy(analyticsEvents.itemId, analyticsEvents.itemType)
				.orderBy(desc(sql`count(*)`))
				.limit(limit);

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
					}
					const tool = await db
						.select()
						.from(tools)
						.where(eq(tools.id, item.itemId))
						.limit(1);
					return {
						...item,
						details: tool[0] || null,
					};
				}),
			);

			return detailedResults.filter((item) => item.details !== null);
		}),

	// Admin: Get referrer data for specific item
	getReferrerData: adminProcedure
		.input(
			z.object({
				itemId: z.string().uuid(),
				itemType: z.enum(["component", "tool"]),
				period: z.enum(["day", "week", "month"]).default("month"),
			}),
		)
		.query(async ({ input }) => {
			const { itemId, itemType, period } = input;

			const daysAgo = period === "day" ? 1 : period === "week" ? 7 : 30;
			const threshold = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

			// Get referrer data grouped by domain
			const referrerStats = await db
				.select({
					referrer: analyticsEvents.referrer,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, itemId),
						eq(analyticsEvents.itemType, itemType),
						eq(analyticsEvents.eventType, "view"), // Only count views for referrer data
						gte(analyticsEvents.createdAt, threshold),
					),
				)
				.groupBy(analyticsEvents.referrer)
				.orderBy(desc(sql`count(*)`));

			// Process referrer data to categorize traffic sources
			const processedReferrers = referrerStats.map((stat) => {
				const referrer = stat.referrer;
				let source = "Direct";
				let domain = "";

				if (referrer && referrer !== "") {
					try {
						const url = new URL(referrer);
						domain = url.hostname.toLowerCase();

						// Categorize based on domain patterns
						if (domain.includes("google.")) {
							source = "Google";
						} else if (domain.includes("github.")) {
							source = "GitHub";
						} else if (
							domain.includes("facebook.") ||
							domain.includes("twitter.") ||
							domain.includes("linkedin.") ||
							domain.includes("reddit.") ||
							domain.includes("discord.")
						) {
							source = "Social";
						} else if (
							domain.includes("stackoverflow.") ||
							domain.includes("dev.to") ||
							domain.includes("hashnode.")
						) {
							source = "Developer Communities";
						} else {
							source = domain;
						}
					} catch {
						source = "Other";
					}
				}

				return {
					source,
					domain,
					visits: stat.count,
				};
			});

			// Aggregate by source category
			const sourceMap = new Map<string, number>();
			for (const item of processedReferrers) {
				const current = sourceMap.get(item.source) || 0;
				sourceMap.set(item.source, current + item.visits);
			}

			// Convert to array and add colors
			const colors = [
				"#8884d8",
				"#82ca9d",
				"#ffc658",
				"#ff7c7c",
				"#8dd1e1",
				"#d084d0",
				"#87ceeb",
				"#ffb347",
				"#98fb98",
				"#f0e68c",
			];

			const referrerData = Array.from(sourceMap.entries())
				.map(([source, visits], index) => ({
					source,
					visits,
					color: colors[index % colors.length],
				}))
				.sort((a, b) => b.visits - a.visits);

			return {
				referrerData,
				totalViews: referrerStats.reduce((sum, stat) => sum + stat.count, 0),
			};
		}),

	// Admin: Get analytics summary
	getSummary: adminProcedure
		.input(
			z.object({
				startDate: z.string().optional(),
				endDate: z.string().optional(),
			}),
		)
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

			// Get daily event counts for the last 30 days with separate view and install counts
			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
			const dailyStats = await db
				.select({
					date: sql<string>`DATE(${analyticsEvents.createdAt})`,
					views: sql<number>`count(*) FILTER (WHERE ${analyticsEvents.eventType} = 'view')`,
					installs: sql<number>`count(*) FILTER (WHERE ${analyticsEvents.eventType} = 'install')`,
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
		.input(
			z.object({
				itemId: z.string().uuid(),
				itemType: z.enum(["component", "tool"]),
				period: z.enum(["day", "week", "month"]).default("month"),
			}),
		)
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
						gte(analyticsEvents.createdAt, threshold),
					),
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
						gte(analyticsEvents.createdAt, threshold),
					),
				)
				.groupBy(
					sql`DATE(${analyticsEvents.createdAt})`,
					analyticsEvents.eventType,
				)
				.orderBy(sql`DATE(${analyticsEvents.createdAt})`);

			return {
				eventsByType,
				dailyBreakdown,
			};
		}),

	// Admin: Get detailed component analytics with KPIs and trends
	getComponentAnalytics: adminProcedure
		.input(
			z.object({
				componentId: z.string().uuid(),
				period: z.enum(["day", "week", "month"]).default("month"),
			}),
		)
		.query(async ({ input }) => {
			const { componentId, period } = input;

			const daysAgo = period === "day" ? 1 : period === "week" ? 7 : 30;
			const currentPeriodStart = new Date(
				Date.now() - daysAgo * 24 * 60 * 60 * 1000,
			);
			const previousPeriodStart = new Date(
				Date.now() - daysAgo * 2 * 24 * 60 * 60 * 1000,
			);

			// Get current period totals
			const currentPeriodEvents = await db
				.select({
					eventType: analyticsEvents.eventType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, componentId),
						eq(analyticsEvents.itemType, "component"),
						gte(analyticsEvents.createdAt, currentPeriodStart),
					),
				)
				.groupBy(analyticsEvents.eventType);

			// Get previous period totals for comparison
			const previousPeriodEvents = await db
				.select({
					eventType: analyticsEvents.eventType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, componentId),
						eq(analyticsEvents.itemType, "component"),
						gte(analyticsEvents.createdAt, previousPeriodStart),
						lt(analyticsEvents.createdAt, currentPeriodStart),
					),
				)
				.groupBy(analyticsEvents.eventType);

			// Calculate KPIs with trends
			const currentViews =
				currentPeriodEvents.find((e) => e.eventType === "view")?.count || 0;
			const currentInstalls =
				currentPeriodEvents.find((e) => e.eventType === "install")?.count || 0;
			const previousViews =
				previousPeriodEvents.find((e) => e.eventType === "view")?.count || 0;
			const previousInstalls =
				previousPeriodEvents.find((e) => e.eventType === "install")?.count || 0;

			// Get total stars and comments from engagement tables
			const [starsCount] = await db
				.select({ count: count() })
				.from(stars)
				.where(
					and(eq(stars.itemType, "component"), eq(stars.itemId, componentId)),
				);

			const [commentsCount] = await db
				.select({ count: count() })
				.from(comments)
				.where(
					and(
						eq(comments.itemType, "component"),
						eq(comments.itemId, componentId),
					),
				);

			// Calculate percentage changes
			const viewsChange =
				previousViews > 0
					? ((currentViews - previousViews) / previousViews) * 100
					: 0;
			const installsChange =
				previousInstalls > 0
					? ((currentInstalls - previousInstalls) / previousInstalls) * 100
					: 0;

			// Get daily time series data
			const timeSeriesData = await db
				.select({
					date: sql<string>`DATE(${analyticsEvents.createdAt})`,
					views: sql<number>`count(*) FILTER (WHERE ${analyticsEvents.eventType} = 'view')`,
					installs: sql<number>`count(*) FILTER (WHERE ${analyticsEvents.eventType} = 'install')`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, componentId),
						eq(analyticsEvents.itemType, "component"),
						gte(analyticsEvents.createdAt, currentPeriodStart),
					),
				)
				.groupBy(sql`DATE(${analyticsEvents.createdAt})`)
				.orderBy(sql`DATE(${analyticsEvents.createdAt})`);

			// Get top engaged users (users with most stars/comments for this component)
			const topStarUsers = await db
				.select({
					user: {
						name: user.name,
						username: user.username,
						image: user.image,
					},
					starredAt: stars.starredAt,
				})
				.from(stars)
				.innerJoin(user, eq(stars.userId, user.id))
				.where(
					and(eq(stars.itemType, "component"), eq(stars.itemId, componentId)),
				)
				.orderBy(desc(stars.starredAt))
				.limit(10);

			const topCommentUsers = await db
				.select({
					user: {
						name: user.name,
						username: user.username,
						image: user.image,
					},
					commentCount: sql<number>`count(*)`,
					lastComment: sql<Date>`max(${comments.createdAt})`,
				})
				.from(comments)
				.innerJoin(user, eq(comments.userId, user.id))
				.where(
					and(
						eq(comments.itemType, "component"),
						eq(comments.itemId, componentId),
					),
				)
				.groupBy(user.id, user.name, user.username, user.image)
				.orderBy(desc(sql`count(*)`))
				.limit(10);

			return {
				kpis: {
					totalViews: currentViews,
					totalInstalls: currentInstalls,
					totalStars: starsCount.count,
					totalComments: commentsCount.count,
					viewsChange: Math.round(viewsChange * 100) / 100,
					installsChange: Math.round(installsChange * 100) / 100,
					starsChange: 0, // Stars are cumulative, so trend is always positive
					commentsChange: 0, // Comments are cumulative, so trend is always positive
				},
				timeSeriesData,
				topStarUsers,
				topCommentUsers,
			};
		}),

	// Admin: Get detailed tool analytics with KPIs and trends
	getToolAnalytics: adminProcedure
		.input(
			z.object({
				toolId: z.string().uuid(),
				period: z.enum(["day", "week", "month"]).default("month"),
			}),
		)
		.query(async ({ input }) => {
			const { toolId, period } = input;

			const daysAgo = period === "day" ? 1 : period === "week" ? 7 : 30;
			const currentPeriodStart = new Date(
				Date.now() - daysAgo * 24 * 60 * 60 * 1000,
			);
			const previousPeriodStart = new Date(
				Date.now() - daysAgo * 2 * 24 * 60 * 60 * 1000,
			);

			// Get current period totals
			const currentPeriodEvents = await db
				.select({
					eventType: analyticsEvents.eventType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, toolId),
						eq(analyticsEvents.itemType, "tool"),
						gte(analyticsEvents.createdAt, currentPeriodStart),
					),
				)
				.groupBy(analyticsEvents.eventType);

			// Get previous period totals for comparison
			const previousPeriodEvents = await db
				.select({
					eventType: analyticsEvents.eventType,
					count: sql<number>`count(*)`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, toolId),
						eq(analyticsEvents.itemType, "tool"),
						gte(analyticsEvents.createdAt, previousPeriodStart),
						lt(analyticsEvents.createdAt, currentPeriodStart),
					),
				)
				.groupBy(analyticsEvents.eventType);

			// Calculate KPIs with trends
			const currentViews =
				currentPeriodEvents.find((e) => e.eventType === "view")?.count || 0;
			const currentInstalls =
				currentPeriodEvents.find((e) => e.eventType === "install")?.count || 0;
			const previousViews =
				previousPeriodEvents.find((e) => e.eventType === "view")?.count || 0;
			const previousInstalls =
				previousPeriodEvents.find((e) => e.eventType === "install")?.count || 0;

			// Get total stars and comments from engagement tables
			const [starsCount] = await db
				.select({ count: count() })
				.from(stars)
				.where(and(eq(stars.itemType, "tool"), eq(stars.itemId, toolId)));

			const [commentsCount] = await db
				.select({ count: count() })
				.from(comments)
				.where(and(eq(comments.itemType, "tool"), eq(comments.itemId, toolId)));

			// Calculate percentage changes
			const viewsChange =
				previousViews > 0
					? ((currentViews - previousViews) / previousViews) * 100
					: 0;
			const installsChange =
				previousInstalls > 0
					? ((currentInstalls - previousInstalls) / previousInstalls) * 100
					: 0;

			// Get daily time series data
			const timeSeriesData = await db
				.select({
					date: sql<string>`DATE(${analyticsEvents.createdAt})`,
					views: sql<number>`count(*) FILTER (WHERE ${analyticsEvents.eventType} = 'view')`,
					installs: sql<number>`count(*) FILTER (WHERE ${analyticsEvents.eventType} = 'install')`,
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.itemId, toolId),
						eq(analyticsEvents.itemType, "tool"),
						gte(analyticsEvents.createdAt, currentPeriodStart),
					),
				)
				.groupBy(sql`DATE(${analyticsEvents.createdAt})`)
				.orderBy(sql`DATE(${analyticsEvents.createdAt})`);

			// Get top engaged users (users with most stars/comments for this tool)
			const topStarUsers = await db
				.select({
					user: {
						name: user.name,
						username: user.username,
						image: user.image,
					},
					starredAt: stars.starredAt,
				})
				.from(stars)
				.innerJoin(user, eq(stars.userId, user.id))
				.where(and(eq(stars.itemType, "tool"), eq(stars.itemId, toolId)))
				.orderBy(desc(stars.starredAt))
				.limit(10);

			const topCommentUsers = await db
				.select({
					user: {
						name: user.name,
						username: user.username,
						image: user.image,
					},
					commentCount: sql<number>`count(*)`,
					lastComment: sql<Date>`max(${comments.createdAt})`,
				})
				.from(comments)
				.innerJoin(user, eq(comments.userId, user.id))
				.where(and(eq(comments.itemType, "tool"), eq(comments.itemId, toolId)))
				.groupBy(user.id, user.name, user.username, user.image)
				.orderBy(desc(sql`count(*)`))
				.limit(10);

			return {
				kpis: {
					totalViews: currentViews,
					totalInstalls: currentInstalls,
					totalStars: starsCount.count,
					totalComments: commentsCount.count,
					viewsChange: Math.round(viewsChange * 100) / 100,
					installsChange: Math.round(installsChange * 100) / 100,
					starsChange: 0, // Stars are cumulative, so trend is always positive
					commentsChange: 0, // Comments are cumulative, so trend is always positive
				},
				timeSeriesData,
				topStarUsers,
				topCommentUsers,
			};
		}),
});
