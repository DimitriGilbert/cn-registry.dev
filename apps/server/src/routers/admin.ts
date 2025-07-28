import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
	adminNotifications,
	categories,
	componentCategories,
	components,
	editsLog,
	githubCache,
	tools,
	user,
} from "../db/schema";
import { adminProcedure, router } from "../lib/trpc";
import { createAdminNotificationSchema, idSchema } from "../lib/validation";

export interface ImportResult {
	type: string;
	total: number;
	success: number;
	errors: number;
	items: Array<{
		name: string;
		status: "success" | "cached" | "error";
		stars?: number;
		error?: string;
	}>;
}

// Progress tracking for bulk operations
const progressCache = new Map<string, {
	total: number;
	processed: number;
	success: number;
	errors: number;
	completed: boolean;
	items: Array<{
		name: string;
		status: "success" | "error" | "processing";
		stars?: number;
		error?: string;
	}>;
}>();

function getGitHubRefreshProgress(jobId: string) {
	return progressCache.get(jobId) || {
		total: 0,
		processed: 0,
		success: 0,
		errors: 0,
		completed: false,
		items: []
	};
}

async function processBulkGitHubRefresh(jobId: string, type: "components" | "tools" | "all") {
	const progress = {
		total: 0,
		processed: 0,
		success: 0,
		errors: 0,
		completed: false,
		items: [] as Array<{
			name: string;
			status: "success" | "error" | "processing";
			stars?: number;
			error?: string;
		}>
	};

	try {
		// Get all items with GitHub URLs
		const allItems: Array<{ id: string; name: string; repoUrl: string; type: string }> = [];

		if (type === "components" || type === "all") {
			const componentsList = await db
				.select({
					id: components.id,
					name: components.name,
					repoUrl: components.repoUrl
				})
				.from(components);

			allItems.push(...componentsList
				.filter((c): c is typeof c & { repoUrl: string } => c.repoUrl !== null && c.repoUrl.includes("github.com"))
				.map(c => ({ ...c, type: "component" }))
			);
		}

		if (type === "tools" || type === "all") {
			const toolsList = await db
				.select({
					id: tools.id,
					name: tools.name,
					repoUrl: tools.repoUrl
				})
				.from(tools);

			allItems.push(...toolsList
				.filter((t): t is typeof t & { repoUrl: string } => t.repoUrl !== null && t.repoUrl.includes("github.com"))
				.map(t => ({ ...t, type: "tool" }))
			);
		}

		// Group by unique repo URLs to avoid duplicate fetches
		const uniqueRepos = new Map<string, Array<typeof allItems[0]>>();
		for (const item of allItems) {
			const cleanUrl = item.repoUrl.replace(/\.git$/, "").toLowerCase();
			if (!uniqueRepos.has(cleanUrl)) {
				uniqueRepos.set(cleanUrl, []);
			}
			uniqueRepos.get(cleanUrl)!.push(item);
		}

		progress.total = uniqueRepos.size;
		progressCache.set(jobId, progress);

		// Process each unique repository
		for (const [repoUrl, items] of uniqueRepos) {
			// Add items to progress as processing
			for (const item of items) {
				progress.items.push({
					name: item.name,
					status: "processing"
				});
			}
			progressCache.set(jobId, progress);

			try {
				// Check if we have recent cached data (respect 1 hour cache)
				const cached = await db
					.select()
					.from(githubCache)
					.where(eq(githubCache.repoUrl, repoUrl))
					.limit(1);

				const oneHourAgo = new Date();
				oneHourAgo.setHours(oneHourAgo.getHours() - 1);

				if (cached.length > 0 && new Date(cached[0].lastFetched) > oneHourAgo) {
					// Use cached data
					const cachedData = JSON.parse(cached[0].data);
					for (const item of items) {
						const itemProgress = progress.items.find(p => p.name === item.name);
						if (itemProgress) {
							itemProgress.status = "success";
							itemProgress.stars = cachedData.stars || cachedData.stargazers_count;
						}
					}
					progress.success++;
				} else {
					// Fetch fresh data
					const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
					if (!match) {
						throw new Error("Invalid GitHub URL");
					}

					const [, owner, repo] = match;
					const cleanRepo = repo.replace(/\.git$/, "");

					const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
						headers: {
							"User-Agent": "cn-registry-admin",
							"Accept": "application/vnd.github.v3+json",
							...(process.env.GITHUB_TOKEN && {
								"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
							})
						}
					});

					if (!repoResponse.ok) {
						throw new Error(`GitHub API error: ${repoResponse.status}`);
					}

					const repoData = await repoResponse.json();

					// Fetch README
					let readme = "";
					try {
						const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
							headers: {
								"User-Agent": "cn-registry-admin",
								"Accept": "application/vnd.github.v3+json",
								...(process.env.GITHUB_TOKEN && {
									"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
								})
							}
						});

						if (readmeResponse.ok) {
							const readmeData = await readmeResponse.json();
							readme = Buffer.from(readmeData.content, readmeData.encoding as BufferEncoding).toString();
						}
					} catch (error) {
						// README fetch failed, continue without it
					}

					// Update cache
					const githubData = {
						...repoData,
						readme,
						fetched_at: new Date().toISOString()
					};

					const expiresAt = new Date();
					expiresAt.setHours(expiresAt.getHours() + 6);

					await db
						.insert(githubCache)
						.values({
							repoUrl,
							data: JSON.stringify(githubData),
							lastFetched: new Date(),
							expiresAt
						})
						.onConflictDoUpdate({
							target: githubCache.repoUrl,
							set: {
								data: JSON.stringify(githubData),
								lastFetched: new Date(),
								expiresAt
							}
						});

					// Update progress for all items using this repo
					for (const item of items) {
						const itemProgress = progress.items.find(p => p.name === item.name);
						if (itemProgress) {
							itemProgress.status = "success";
							itemProgress.stars = repoData.stargazers_count;
						}
					}
					progress.success++;
				}

			} catch (error) {
				// Mark all items from this repo as failed
				for (const item of items) {
					const itemProgress = progress.items.find(p => p.name === item.name);
					if (itemProgress) {
						itemProgress.status = "error";
						itemProgress.error = error instanceof Error ? error.message : String(error);
					}
				}
				progress.errors++;
			}

			progress.processed++;
			progressCache.set(jobId, progress);

			// Rate limiting - wait between requests (increased delays to avoid rate limiting)
			await new Promise(resolve => setTimeout(resolve, process.env.GITHUB_TOKEN ? 2000 : 5000));
		}

		progress.completed = true;
		progressCache.set(jobId, progress);

		// Clean up after 10 minutes
		setTimeout(() => {
			progressCache.delete(jobId);
		}, 10 * 60 * 1000);

	} catch (error) {
		progress.completed = true;
		progress.errors = progress.total;
		progressCache.set(jobId, progress);
	}
}

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
						websiteUrl: z
							.string()
							.transform((val) => (val === "" ? undefined : val))
							.pipe(z.string().url().optional())
							.optional(),
						installUrl: z
							.string()
							.transform((val) => (val === "" ? undefined : val))
							.pipe(z.string().url().optional())
							.optional(),
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
					if (url.hostname === "github.com") {
						const pathParts = url.pathname.split("/").filter(Boolean);
						if (pathParts.length >= 1) {
							return pathParts[0]; // First part is the username
						}
					}
				} catch (error) {
					console.warn("Failed to extract GitHub username from URL:", repoUrl);
				}
				return null;
			}

			// Helper function to get or create user profile from GitHub username
			async function getOrCreateUserFromGitHub(
				repoUrl: string,
			): Promise<string> {
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
							role: "creator",
							bio: `GitHub: https://github.com/${username}`,
							verified: false,
							createdAt: now,
							updatedAt: now,
						})
						.returning();
					return newUser.id;
				} catch (error) {
					console.warn(
						"Failed to create user profile for GitHub username:",
						username,
						error,
					);
					return ctx.user.id; // Fallback to current admin user
				}
			}

			// Process each component individually in its own transaction
			for (const componentData of componentsData) {
				try {
					// Validate component data first
					if (!componentData.name || !componentData.repoUrl) {
						errors.push(
							"Component skipped: Missing required fields (name or repoUrl)",
						);
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
					const creatorId = await getOrCreateUserFromGitHub(
						componentData.repoUrl,
					);

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
							console.warn(
								`Categories linking failed for "${componentData.name}":`,
								categoryError,
							);
							errors.push(
								`Component "${componentData.name}" imported but category linking failed`,
							);
						}
					}

					importedCount++;
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : String(error);
					console.error(
						`Failed to import component "${componentData.name}":`,
						error,
					);
					errors.push(
						`Component "${componentData.name}" failed: ${errorMessage}`,
					);
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

	// Import GitHub data for all components and tools
	importGitHubData: adminProcedure
		.input(z.object({
			type: z.enum(["components", "tools", "all"]).default("all"),
			force: z.boolean().default(false) // Force refresh even if cached
		}))
		.mutation(async ({ input }) => {
			const { type, force } = input;
			
			async function importGitHubForItems(
				items: Array<{ id: string; name: string; repoUrl: string | null }>,
				itemType: string
			): Promise<ImportResult> {
				const result: ImportResult = {
					type: itemType,
					total: 0,
					success: 0,
					errors: 0,
					items: []
				};
				
				const githubItems = items.filter(item => 
					item.repoUrl && item.repoUrl.includes("github.com")
				);
				
				result.total = githubItems.length;
				
				for (const item of githubItems) {
					try {
						const repoUrl = item.repoUrl!;
						
						// Check cache if not forcing refresh
						if (!force) {
							const cached = await db
								.select()
								.from(githubCache)
								.where(eq(githubCache.repoUrl, repoUrl))
								.limit(1);
							
							if (cached.length > 0 && new Date(cached[0].expiresAt) > new Date()) {
								result.success++;
								const cachedData = JSON.parse(cached[0].data);
								result.items.push({
									name: item.name,
									status: "cached",
									stars: cachedData.stars || cachedData.stargazers_count
								});
								continue;
							}
						}
						
						// Extract owner/repo from URL
						const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
						if (!match) {
							result.errors++;
							result.items.push({
								name: item.name,
								status: "error",
								error: "Invalid GitHub URL"
							});
							continue;
						}
						
						const [, owner, repo] = match;
						const cleanRepo = repo.replace(/\.git$/, "");
						
						// Fetch GitHub data
						const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
							headers: {
								"User-Agent": "cn-registry-admin",
								"Accept": "application/vnd.github.v3+json",
								...(process.env.GITHUB_TOKEN && {
									"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
								})
							}
						});
						
						if (!repoResponse.ok) {
							result.errors++;
							result.items.push({
								name: item.name,
								status: "error",
								error: `GitHub API error: ${repoResponse.status}`
							});
							continue;
						}
						
						const repoData = await repoResponse.json();
						
						// Fetch README
						let readme = "";
						try {
							const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
								headers: {
									"User-Agent": "cn-registry-admin",
									"Accept": "application/vnd.github.v3+json",
									...(process.env.GITHUB_TOKEN && {
										"Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
									})
								}
							});
							
							if (readmeResponse.ok) {
								const readmeData = await readmeResponse.json();
								readme = Buffer.from(readmeData.content, readmeData.encoding as BufferEncoding).toString();
							}
						} catch (error) {
							// README fetch failed, continue without it
						}
						
						// Prepare cached data
						const githubData = {
							...repoData,
							readme,
							fetched_at: new Date().toISOString()
						};
						
						// Update cache
						const expiresAt = new Date();
						expiresAt.setHours(expiresAt.getHours() + 6);
						
						await db
							.insert(githubCache)
							.values({
								repoUrl,
								data: JSON.stringify(githubData),
								lastFetched: new Date(),
								expiresAt
							})
							.onConflictDoUpdate({
								target: githubCache.repoUrl,
								set: {
									data: JSON.stringify(githubData),
									lastFetched: new Date(),
									expiresAt
								}
							});
						
						result.success++;
						result.items.push({
							name: item.name,
							status: "success",
							stars: repoData.stargazers_count
						});
						
						// Rate limiting (increased delays to avoid rate limiting)
						await new Promise(resolve => setTimeout(resolve, process.env.GITHUB_TOKEN ? 1500 : 3000));
						
					} catch (error) {
						result.errors++;
						result.items.push({
							name: item.name,
							status: "error",
							error: error instanceof Error ? error.message : String(error)
						});
					}
				}
				
				return result;
			}
			
			const results: ImportResult[] = [];
			
			// Import components
			if (type === "components" || type === "all") {
				const componentsList = await db
					.select({
						id: components.id,
						name: components.name,
						repoUrl: components.repoUrl
					})
					.from(components);
				
				const componentResult = await importGitHubForItems(componentsList, "components");
				results.push(componentResult);
			}
			
			// Import tools
			if (type === "tools" || type === "all") {
				const toolsList = await db
					.select({
						id: tools.id,
						name: tools.name,
						repoUrl: tools.repoUrl
					})
					.from(tools);
				
				const toolResult = await importGitHubForItems(toolsList, "tools");
				results.push(toolResult);
			}
			
			return {
				results,
				summary: {
					totalItems: results.reduce((sum, r) => sum + r.total, 0),
					totalSuccess: results.reduce((sum, r) => sum + r.success, 0),
					totalErrors: results.reduce((sum, r) => sum + r.errors, 0)
				}
			};
		}),

	// Bulk GitHub refresh with progress tracking
	bulkGitHubRefresh: adminProcedure
		.input(z.object({
			type: z.enum(["components", "tools", "all"]).default("all"),
		}))
		.mutation(async ({ input }) => {
			const jobId = `github-refresh-${Date.now()}`;
			
			// Start the background job
			setImmediate(() => processBulkGitHubRefresh(jobId, input.type));
			
			return { jobId };
		}),

	// Get GitHub refresh progress
	getGitHubRefreshProgress: adminProcedure
		.input(z.object({
			jobId: z.string(),
		}))
		.query(async ({ input }) => {
			const progress = getGitHubRefreshProgress(input.jobId);
			return progress;
		}),
});
