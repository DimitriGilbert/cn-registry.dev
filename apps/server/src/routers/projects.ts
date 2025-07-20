import { and, avg, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
	categories,
	componentCategories,
	components,
	projectCollaborators,
	projectComponents,
	projects,
	ratings,
	stars,
	user,
} from "../db/schema";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import {
	addCollaboratorSchema,
	addComponentsToProjectSchema,
	createProjectSchema,
	generateInstallConfigSchema,
	idSchema,
	projectIdSchema,
	projectSlugSchema,
	removeCollaboratorSchema,
	removeComponentFromProjectSchema,
	updateCollaboratorRoleSchema,
	updateProjectSchema,
} from "../lib/validation";

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export const projectsRouter = router({
	// Create a new project
	create: protectedProcedure
		.input(createProjectSchema)
		.mutation(async ({ ctx, input }) => {
			const slug = input.slug || generateSlug(input.name);

			// Check if slug already exists for this user
			const existingProject = await db
				.select()
				.from(projects)
				.where(and(eq(projects.slug, slug), eq(projects.userId, ctx.user.id)))
				.limit(1);

			if (existingProject[0]) {
				throw new Error("A project with this name already exists");
			}

			const [project] = await db
				.insert(projects)
				.values({
					name: input.name,
					description: input.description,
					slug,
					userId: ctx.user.id,
					visibility: input.visibility,
				})
				.returning();

			// Add creator as owner collaborator
			await db.insert(projectCollaborators).values({
				projectId: project.id,
				userId: ctx.user.id,
				role: "owner",
			});

			return project;
		}),

	// Get all projects for current user
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const userProjects = await db
			.select({
				id: projects.id,
				name: projects.name,
				description: projects.description,
				slug: projects.slug,
				visibility: projects.visibility,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
				role: projectCollaborators.role,
			})
			.from(projects)
			.innerJoin(
				projectCollaborators,
				eq(projects.id, projectCollaborators.projectId),
			)
			.where(eq(projectCollaborators.userId, ctx.user.id))
			.orderBy(desc(projects.updatedAt));

		// Get component counts for each project
		const projectsWithStats = await Promise.all(
			userProjects.map(async (project) => {
				const [componentCount] = await db
					.select({ count: count() })
					.from(projectComponents)
					.where(eq(projectComponents.projectId, project.id));

				const [collaboratorCount] = await db
					.select({ count: count() })
					.from(projectCollaborators)
					.where(eq(projectCollaborators.projectId, project.id));

				return {
					...project,
					componentCount: componentCount.count,
					collaboratorCount: collaboratorCount.count,
				};
			}),
		);

		return projectsWithStats;
	}),

	// Get project by ID with full details
	getById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
		// Check if user has access to this project
		const projectAccess = await db
			.select({
				project: projects,
				role: projectCollaborators.role,
			})
			.from(projects)
			.innerJoin(
				projectCollaborators,
				eq(projects.id, projectCollaborators.projectId),
			)
			.where(
				and(
					eq(projects.id, input.id),
					eq(projectCollaborators.userId, ctx.user.id),
				),
			)
			.limit(1);

		if (!projectAccess[0]) {
			throw new Error("Project not found or access denied");
		}

		const { project, role } = projectAccess[0];

		// Get collaborators
		const collaborators = await db
			.select({
				userId: projectCollaborators.userId,
				role: projectCollaborators.role,
				addedAt: projectCollaborators.addedAt,
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				},
			})
			.from(projectCollaborators)
			.innerJoin(user, eq(projectCollaborators.userId, user.id))
			.where(eq(projectCollaborators.projectId, input.id));

		return {
			...project,
			role,
			collaborators,
		};
	}),

	// Get project by slug (for public access)
	getBySlug: publicProcedure
		.input(projectSlugSchema)
		.query(async ({ input }) => {
			const project = await db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					slug: projects.slug,
					visibility: projects.visibility,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(projects)
				.innerJoin(user, eq(projects.userId, user.id))
				.where(
					and(eq(projects.slug, input.slug), eq(projects.visibility, "public")),
				)
				.limit(1);

			if (!project[0]) {
				throw new Error("Project not found");
			}

			return project[0];
		}),

	// Update project
	update: protectedProcedure
		.input(updateProjectSchema.extend({ id: idSchema.shape.id }))
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Check if user has edit access
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, id),
						eq(projectCollaborators.userId, ctx.user.id),
						inArray(projectCollaborators.role, ["owner", "editor"]),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			const updatePayload = { ...updateData };
			if (updateData.name && !updateData.slug) {
				updatePayload.slug = generateSlug(updateData.name);
			}

			const [project] = await db
				.update(projects)
				.set({
					...updatePayload,
					updatedAt: new Date(),
				})
				.where(eq(projects.id, id))
				.returning();

			return project;
		}),

	// Delete project
	delete: protectedProcedure
		.input(idSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if user is owner
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, input.id),
						eq(projectCollaborators.userId, ctx.user.id),
						eq(projectCollaborators.role, "owner"),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			await db.delete(projects).where(eq(projects.id, input.id));
			return { success: true };
		}),

	// Add components to project (bulk operation from cart)
	addComponents: protectedProcedure
		.input(addComponentsToProjectSchema)
		.mutation(async ({ ctx, input }) => {
			const { projectId, componentIds } = input;

			// Check if user has edit access
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, ctx.user.id),
						inArray(projectCollaborators.role, ["owner", "editor"]),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			// Get existing components in project to avoid duplicates
			const existingComponents = await db
				.select({ componentId: projectComponents.componentId })
				.from(projectComponents)
				.where(eq(projectComponents.projectId, projectId));

			const existingIds = new Set(existingComponents.map((c) => c.componentId));
			const newComponentIds = componentIds.filter((id) => !existingIds.has(id));

			if (newComponentIds.length === 0) {
				return { added: 0, skipped: componentIds.length };
			}

			// Insert new components
			const insertData = newComponentIds.map((componentId) => ({
				projectId,
				componentId,
			}));

			await db.insert(projectComponents).values(insertData);

			// Update project timestamp
			await db
				.update(projects)
				.set({ updatedAt: new Date() })
				.where(eq(projects.id, projectId));

			return {
				added: newComponentIds.length,
				skipped: componentIds.length - newComponentIds.length,
			};
		}),

	// Remove component from project
	removeComponent: protectedProcedure
		.input(removeComponentFromProjectSchema)
		.mutation(async ({ ctx, input }) => {
			const { projectId, componentId } = input;

			// Check if user has edit access
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, ctx.user.id),
						inArray(projectCollaborators.role, ["owner", "editor"]),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			await db
				.delete(projectComponents)
				.where(
					and(
						eq(projectComponents.projectId, projectId),
						eq(projectComponents.componentId, componentId),
					),
				);

			// Update project timestamp
			await db
				.update(projects)
				.set({ updatedAt: new Date() })
				.where(eq(projects.id, projectId));

			return { success: true };
		}),

	// Get components in project
	getComponents: protectedProcedure
		.input(projectIdSchema)
		.query(async ({ ctx, input }) => {
			const { projectId } = input;

			// Check if user has access
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, ctx.user.id),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			const projectComponentsData = await db
				.select({
					addedAt: projectComponents.addedAt,
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
				.from(projectComponents)
				.innerJoin(components, eq(projectComponents.componentId, components.id))
				.leftJoin(user, eq(components.creatorId, user.id))
				.where(eq(projectComponents.projectId, projectId))
				.orderBy(desc(projectComponents.addedAt));

			// Get categories and stats for each component
			const componentsWithDetails = await Promise.all(
				projectComponentsData.map(async (component) => {
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

					return {
						...component,
						categories: componentCategoriesData
							.map((cc) => cc.category)
							.filter(Boolean),
						starsCount: starsCount.count,
						githubUrl: component.repoUrl,
						isStarred: false,
						forksCount: 0,
						issuesCount: 0,
						watchersCount: 0,
						readme: null,
						exampleCode: null,
						previewUrl: null,
					};
				}),
			);

			return componentsWithDetails;
		}),

	// Add collaborator
	addCollaborator: protectedProcedure
		.input(addCollaboratorSchema)
		.mutation(async ({ ctx, input }) => {
			const { projectId, userId, role } = input;

			// Check if current user is owner
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, ctx.user.id),
						eq(projectCollaborators.role, "owner"),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			// Check if user exists
			const targetUser = await db
				.select()
				.from(user)
				.where(eq(user.id, userId))
				.limit(1);

			if (!targetUser[0]) {
				throw new Error("User not found");
			}

			// Add collaborator
			const [collaborator] = await db
				.insert(projectCollaborators)
				.values({
					projectId,
					userId,
					role,
				})
				.onConflictDoUpdate({
					target: [projectCollaborators.projectId, projectCollaborators.userId],
					set: { role, addedAt: new Date() },
				})
				.returning();

			return collaborator;
		}),

	// Remove collaborator
	removeCollaborator: protectedProcedure
		.input(removeCollaboratorSchema)
		.mutation(async ({ ctx, input }) => {
			const { projectId, userId } = input;

			// Check if current user is owner
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, ctx.user.id),
						eq(projectCollaborators.role, "owner"),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			// Cannot remove the owner
			if (userId === ctx.user.id) {
				throw new Error("Cannot remove project owner");
			}

			await db
				.delete(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, userId),
					),
				);

			return { success: true };
		}),

	// Update collaborator role
	updateCollaboratorRole: protectedProcedure
		.input(updateCollaboratorRoleSchema)
		.mutation(async ({ ctx, input }) => {
			const { projectId, userId, role } = input;

			// Check if current user is owner
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, ctx.user.id),
						eq(projectCollaborators.role, "owner"),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			// Cannot change own role
			if (userId === ctx.user.id) {
				throw new Error("Cannot change own role");
			}

			const [collaborator] = await db
				.update(projectCollaborators)
				.set({ role })
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, userId),
					),
				)
				.returning();

			return collaborator;
		}),

	// Generate install configuration
	generateInstallConfig: protectedProcedure
		.input(generateInstallConfigSchema)
		.query(async ({ ctx, input }) => {
			const { projectId, format } = input;

			// Check if user has access
			const access = await db
				.select()
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, projectId),
						eq(projectCollaborators.userId, ctx.user.id),
					),
				)
				.limit(1);

			if (!access[0]) {
				throw new Error("Project not found or access denied");
			}

			// Get project components
			const projectComponentsData = await db
				.select({
					id: components.id,
					name: components.name,
					installCommand: components.installCommand,
					tags: components.tags,
				})
				.from(projectComponents)
				.innerJoin(components, eq(projectComponents.componentId, components.id))
				.where(eq(projectComponents.projectId, projectId));

			const componentsList = projectComponentsData;

			if (format === "cli") {
				// Generate CLI command
				const componentNames = componentsList.map((c) => c.name).join(" ");
				return {
					command: `npx shadcn@latest add ${componentNames}`,
					components: componentsList,
				};
			}

			if (format === "registry") {
				// Generate registry.json format
				const registry = {
					name: "Custom Project Registry",
					items: componentsList.map((component) => ({
						name: component.name,
						type: "components:ui",
						files: [],
						dependencies: [],
						registryDependencies: [],
					})),
				};
				return registry;
			}

			if (format === "package-json") {
				// Extract dependencies from install commands
				const dependencies: Record<string, string> = {};
				componentsList.forEach((component) => {
					if (component.installCommand?.includes("npm install")) {
						const packages = component.installCommand
							.replace("npm install", "")
							.trim()
							.split(" ");
						packages.forEach((pkg) => {
							if (pkg && !pkg.startsWith("-")) {
								dependencies[pkg] = "latest";
							}
						});
					}
				});
				return { dependencies };
			}

			return { components: componentsList };
		}),

	// Get public project by slug
	getPublicProject: publicProcedure
		.input(projectSlugSchema)
		.query(async ({ input }) => {
			const project = await db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					slug: projects.slug,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(projects)
				.innerJoin(user, eq(projects.userId, user.id))
				.where(
					and(eq(projects.slug, input.slug), eq(projects.visibility, "public")),
				)
				.limit(1);

			if (!project[0]) {
				throw new Error("Project not found");
			}

			// Get public project components (simplified)
			const projectComponentsData = await db
				.select({
					id: components.id,
					name: components.name,
					description: components.description,
					repoUrl: components.repoUrl,
					websiteUrl: components.websiteUrl,
					tags: components.tags,
					createdAt: components.createdAt,
				})
				.from(projectComponents)
				.innerJoin(components, eq(projectComponents.componentId, components.id))
				.where(eq(projectComponents.projectId, project[0].id))
				.orderBy(desc(projectComponents.addedAt));

			return {
				...project[0],
				components: projectComponentsData,
				componentCount: projectComponentsData.length,
			};
		}),

	// Get project by slug with user role (for editing)
	getBySlugWithRole: protectedProcedure
		.input(projectSlugSchema)
		.query(async ({ ctx, input }) => {
			// First get the project
			const project = await db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					slug: projects.slug,
					visibility: projects.visibility,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(projects)
				.innerJoin(user, eq(projects.userId, user.id))
				.where(eq(projects.slug, input.slug))
				.limit(1);

			if (!project[0]) {
				throw new Error("Project not found");
			}

			// Get user's role in this project
			const userRole = await db
				.select({
					role: projectCollaborators.role,
				})
				.from(projectCollaborators)
				.where(
					and(
						eq(projectCollaborators.projectId, project[0].id),
						eq(projectCollaborators.userId, ctx.user.id),
					),
				)
				.limit(1);

			if (!userRole[0]) {
				throw new Error("Access denied");
			}

			// Get collaborators
			const collaborators = await db
				.select({
					userId: projectCollaborators.userId,
					role: projectCollaborators.role,
					addedAt: projectCollaborators.addedAt,
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(projectCollaborators)
				.innerJoin(user, eq(projectCollaborators.userId, user.id))
				.where(eq(projectCollaborators.projectId, project[0].id));

			return {
				...project[0],
				role: userRole[0].role,
				collaborators,
			};
		}),
});
