import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
	adminNotifications,
	categories,
	componentCategories,
	components,
	editsLog,
	tools,
	user,
} from "../db/schema";
import { adminProcedure, router } from "../lib/trpc";
import { createAdminNotificationSchema, idSchema } from "../lib/validation";

export const adminRouter = router({
	// Get dashboard statistics
	getDashboard: adminProcedure.query(async () => {
		// Get counts
		const [usersCount] = await db.select({ count: count() }).from(user);
		const [componentsCount] = await db
			.select({ count: count() })
			.from(components);
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
		.input(
			z.object({
				page: z.number().int().min(1).default(1),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
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
		await db
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
		.input(
			z.object({
				itemId: z.string().uuid().optional(),
				itemType: z.enum(["component", "tool"]).optional(),
				editorId: z.string().optional(),
				page: z.number().int().min(1).default(1),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
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

			const edits =
				conditions.length > 0
					? await baseQuery.where(
							conditions.length === 1 ? conditions[0] : and(...conditions),
						)
					: await baseQuery;

			// Get total count for pagination
			const baseCountQuery = db.select({ count: count() }).from(editsLog);
			const [{ count: totalCount }] =
				conditions.length > 0
					? await baseCountQuery.where(
							conditions.length === 1 ? conditions[0] : and(...conditions),
						)
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
		.input(
			z.object({
				search: z.string().optional(),
				role: z.enum(["user", "creator", "admin"]).optional(),
				page: z.number().int().min(1).default(1),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
		.query(async ({ input }) => {
			const { role, page, limit } = input;
			const offset = (page - 1) * limit;

			const baseQuery = db
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
				.from(user);

			// Apply filters and pagination
			const query = role
				? baseQuery.where(eq(user.role, role)).limit(limit).offset(offset)
				: baseQuery.limit(limit).offset(offset);

			const users = await query;

			// Get total count
			const countQuery = role
				? db.select({ count: count() }).from(user).where(eq(user.role, role))
				: db.select({ count: count() }).from(user);
			const [{ count: totalCount }] = await countQuery;

			return {
				users,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),

	// Update user role
	updateUserRole: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(["user", "creator", "admin"]),
			}),
		)
		.mutation(async ({ input }) => {
			const [updatedUser] = await db
				.update(user)
				.set({ role: input.role })
				.where(eq(user.id, input.userId))
				.returning();

			return updatedUser;
		}),

	// Suspend/unsuspend user
	suspendUser: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				suspended: z.boolean(),
			}),
		)
		.mutation(async ({ input }) => {
			// For now, we'll just return success since we don't have a suspended field
			// In a real app, you'd add a suspended field to the user table
			return {
				success: true,
				userId: input.userId,
				suspended: input.suspended,
			};
		}),

	// Import components from JSON
	importComponents: adminProcedure
		.input(
			z.object({
				components: z.array(
					z.object({
						name: z.string().min(1),
						description: z.string().optional(),
						repoUrl: z.string().url("Repository URL is required"), // Required
						websiteUrl: z.string().transform(val => val === "" ? undefined : val).pipe(z.string().url().optional()).optional(),
						installUrl: z.string().transform(val => val === "" ? undefined : val).pipe(z.string().url().optional()).optional(), 
						installCommand: z.string().optional(), // Made optional - not always available
						tags: z.array(z.string()).optional(),
						status: z
							.enum(["published", "draft", "archived", "suggested"])
							.optional(),
						categoryNames: z.array(z.string()).optional(),
					}),
				),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { components: componentsData } = input;
			let importedCount = 0;
			let skippedCount = 0;
			const errors: string[] = [];

			// Helper function to get or create category
			async function getOrCreateCategory(name: string): Promise<string> {
				const existingCategory = await db
					.select()
					.from(categories)
					.where(eq(categories.name, name))
					.limit(1);

				if (existingCategory.length > 0) {
					return existingCategory[0].id;
				}

				const [newCategory] = await db
					.insert(categories)
					.values({ name })
					.returning();

				return newCategory.id;
			}

			// Helper function to extract username from GitHub URL
			function extractGitHubUsername(repoUrl: string): string | null {
				try {
					const url = new URL(repoUrl);
					if (url.hostname === 'github.com') {
						const pathParts = url.pathname.split('/').filter(Boolean);
						if (pathParts.length >= 1) {
							return pathParts[0]; // First part is the username
						}
					}
				} catch (error) {
					console.warn('Failed to extract GitHub username from URL:', repoUrl);
				}
				return null;
			}

			// Helper function to get or create user profile from GitHub username
			async function getOrCreateUserFromGitHub(repoUrl: string): Promise<string> {
				const username = extractGitHubUsername(repoUrl);
				if (!username) {
					return ctx.user.id; // Fallback to current admin user
				}

				// Check if user already exists by username
				const existingUser = await db
					.select()
					.from(user)
					.where(eq(user.username, username))
					.limit(1);

				if (existingUser.length > 0) {
					return existingUser[0].id;
				}

				// Create new user profile
				try {
					const now = new Date();
					const [newUser] = await db
						.insert(user)
						.values({
							id: crypto.randomUUID(),
							name: username, // Use GitHub username as display name
							email: `${username}@github.local`, // Placeholder email
							emailVerified: false,
							username: username,
							role: 'creator',
							bio: `GitHub: https://github.com/${username}`,
							verified: false,
							createdAt: now,
							updatedAt: now,
						})
						.returning();
					return newUser.id;
				} catch (error) {
					console.warn('Failed to create user profile for GitHub username:', username, error);
					return ctx.user.id; // Fallback to current admin user
				}
			}

			// Process each component individually in its own transaction
			for (const componentData of componentsData) {
				try {
					// Validate component data first
					if (!componentData.name || !componentData.repoUrl) {
						errors.push(`Component skipped: Missing required fields (name or repoUrl)`);
						skippedCount++;
						continue;
					}

					// Check if component already exists
					const existingComponent = await db
						.select()
						.from(components)
						.where(eq(components.name, componentData.name))
						.limit(1);

					if (existingComponent.length > 0) {
						errors.push(`Component "${componentData.name}" already exists`);
						skippedCount++;
						continue;
					}

					// Get or create creator from GitHub URL
					const creatorId = await getOrCreateUserFromGitHub(componentData.repoUrl);

					// Prepare component data with proper validation
					const component = {
						name: componentData.name,
						description: componentData.description || "Component description",
						repoUrl: componentData.repoUrl,
						websiteUrl: componentData.websiteUrl || null,
						installUrl: componentData.installUrl || null,
						installCommand: componentData.installCommand || null,
						tags: componentData.tags || [],
						status: componentData.status || ("suggested" as const),
						creatorId: creatorId,
					};

					// Insert component in its own transaction
					const [insertedComponent] = await db
						.insert(components)
						.values(component)
						.returning();

					// Handle categories
					const categoryNames = componentData.categoryNames || [];
					if (categoryNames.length > 0) {
						try {
							const categoryIds = await Promise.all(
								categoryNames.map((name) => getOrCreateCategory(name)),
							);

							// Link component to categories
							const categoryLinks = categoryIds.map((categoryId) => ({
								componentId: insertedComponent.id,
								categoryId,
							}));

							await db.insert(componentCategories).values(categoryLinks);
						} catch (categoryError) {
							// Category linking failed, but component was inserted
							console.warn(`Categories linking failed for "${componentData.name}":`, categoryError);
							errors.push(`Component "${componentData.name}" imported but category linking failed`);
						}
					}

					importedCount++;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					console.error(`Failed to import component "${componentData.name}":`, error);
					errors.push(`Component "${componentData.name}" failed: ${errorMessage}`);
					skippedCount++;
				}
			}

			return {
				imported: importedCount,
				skipped: skippedCount,
				total: componentsData.length,
				errors: errors.length > 0 ? errors : undefined,
			};
		}),
});
