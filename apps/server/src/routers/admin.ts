import { z } from "zod";
import { router, adminProcedure } from "../lib/trpc";
import { db } from "../db";
import { adminNotifications, editsLog, user, components, tools } from "../db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { createAdminNotificationSchema, idSchema } from "../lib/validation";

export const adminRouter = router({
	// Get dashboard statistics
	getDashboard: adminProcedure.query(async () => {
		// Get counts
		const [usersCount] = await db.select({ count: count() }).from(user);
		const [componentsCount] = await db.select({ count: count() }).from(components);
		const [toolsCount] = await db.select({ count: count() }).from(tools);
		const [unreadNotifications] = await db
			.select({ count: count() })
			.from(adminNotifications)
			.where(eq(adminNotifications.isRead, false));

		// Get recent edits
		const recentEdits = await db
			.select({
				id: editsLog.id,
				itemType: editsLog.itemType,
				itemId: editsLog.itemId,
				changes: editsLog.changes,
				editedAt: editsLog.editedAt,
				editor: {
					id: user.id,
					name: user.name,
					username: user.username,
				},
			})
			.from(editsLog)
			.leftJoin(user, eq(editsLog.editorId, user.id))
			.orderBy(desc(editsLog.editedAt))
			.limit(10);

		return {
			stats: {
				usersCount: usersCount.count,
				componentsCount: componentsCount.count,
				toolsCount: toolsCount.count,
				unreadNotificationsCount: unreadNotifications.count,
			},
			recentEdits,
		};
	}),

	// Get all notifications
	getNotifications: adminProcedure
		.input(z.object({
			page: z.number().int().min(1).default(1),
			limit: z.number().int().min(1).max(100).default(20),
		}))
		.query(async ({ input }) => {
			const { page, limit } = input;
			const offset = (page - 1) * limit;

			const notifications = await db
				.select()
				.from(adminNotifications)
				.orderBy(desc(adminNotifications.createdAt))
				.limit(limit)
				.offset(offset);

			const [{ count: totalCount }] = await db
				.select({ count: count() })
				.from(adminNotifications);

			return {
				notifications,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),

	// Create notification
	createNotification: adminProcedure
		.input(createAdminNotificationSchema)
		.mutation(async ({ input }) => {
			const [notification] = await db
				.insert(adminNotifications)
				.values(input)
				.returning();

			return notification;
		}),

	// Mark notification as read
	markNotificationAsRead: adminProcedure
		.input(idSchema)
		.mutation(async ({ input }) => {
			const [notification] = await db
				.update(adminNotifications)
				.set({ isRead: true })
				.where(eq(adminNotifications.id, input.id))
				.returning();

			return notification;
		}),

	// Mark all notifications as read
	markAllNotificationsAsRead: adminProcedure.mutation(async () => {
		const result = await db
			.update(adminNotifications)
			.set({ isRead: true })
			.where(eq(adminNotifications.isRead, false));

		return { success: true };
	}),

	// Delete notification
	deleteNotification: adminProcedure
		.input(idSchema)
		.mutation(async ({ input }) => {
			await db
				.delete(adminNotifications)
				.where(eq(adminNotifications.id, input.id));

			return { success: true };
		}),

	// Get edit history
	getEditHistory: adminProcedure
		.input(z.object({
			itemId: z.string().uuid().optional(),
			itemType: z.enum(["component", "tool"]).optional(),
			editorId: z.string().optional(),
			page: z.number().int().min(1).default(1),
			limit: z.number().int().min(1).max(100).default(20),
		}))
		.query(async ({ input }) => {
			const { itemId, itemType, editorId, page, limit } = input;
			const offset = (page - 1) * limit;

			// Build WHERE conditions
			const conditions = [];
			if (itemId) conditions.push(eq(editsLog.itemId, itemId));
			if (itemType) conditions.push(eq(editsLog.itemType, itemType));
			if (editorId) conditions.push(eq(editsLog.editorId, editorId));

			// Build query with conditional WHERE
			const baseQuery = db
				.select({
					id: editsLog.id,
					itemType: editsLog.itemType,
					itemId: editsLog.itemId,
					changes: editsLog.changes,
					editedAt: editsLog.editedAt,
					editor: {
						id: user.id,
						name: user.name,
						username: user.username,
					},
				})
				.from(editsLog)
				.leftJoin(user, eq(editsLog.editorId, user.id))
				.orderBy(desc(editsLog.editedAt))
				.limit(limit)
				.offset(offset);

			const edits = conditions.length > 0 
				? await baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
				: await baseQuery;

			// Get total count for pagination
			const baseCountQuery = db.select({ count: count() }).from(editsLog);
			const [{ count: totalCount }] = conditions.length > 0
				? await baseCountQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
				: await baseCountQuery;

			return {
				edits,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),

	// Get user management data
	getUsersForManagement: adminProcedure
		.input(z.object({
			search: z.string().optional(),
			role: z.enum(["user", "creator", "admin"]).optional(),
			page: z.number().int().min(1).default(1),
			limit: z.number().int().min(1).max(100).default(20),
		}))
		.query(async ({ input }) => {
			const { search, role, page, limit } = input;
			const offset = (page - 1) * limit;

			let query = db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					email: user.email,
					role: user.role,
					image: user.image,
					emailVerified: user.emailVerified,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				})
				.from(user)
				.limit(limit)
				.offset(offset);

			// Apply filters (simplified - in real implementation would use proper WHERE conditions)
			if (role) {
				query = query.where(eq(user.role, role));
			}

			const users = await query;

			// Get total count
			let countQuery = db.select({ count: count() }).from(user);
			if (role) {
				countQuery = countQuery.where(eq(user.role, role));
			}
			const [{ count: totalCount }] = await countQuery;

			return {
				users,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),
});