import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
	categories,
	componentCategories,
	components,
	projectCollaborators,
	projects,
	stars,
	toolCategories,
	tools,
	user,
} from "../db/schema";
import { publicProcedure, router } from "../lib/trpc";

export const searchRouter = router({
	// Global search across components, tools, and projects
	global: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(async ({ input }) => {
			const { query, limit } = input;
			const searchTerm = `%${query}%`;

			// Search components
			const componentResults = await db
				.select({
					id: components.id,
					name: components.name,
					description: components.description,
					repoUrl: components.repoUrl,
					websiteUrl: components.websiteUrl,
					tags: components.tags,
					createdAt: components.createdAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(components)
				.leftJoin(user, eq(components.creatorId, user.id))
				.where(
					or(
						ilike(components.name, searchTerm),
						ilike(components.description, searchTerm),
					),
				)
				.orderBy(desc(components.createdAt))
				.limit(Math.floor(limit / 3) + 1);

			// Search tools
			const toolResults = await db
				.select({
					id: tools.id,
					name: tools.name,
					description: tools.description,
					repoUrl: tools.repoUrl,
					websiteUrl: tools.websiteUrl,
					tags: tools.tags,
					createdAt: tools.createdAt,
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(tools)
				.leftJoin(user, eq(tools.creatorId, user.id))
				.where(
					or(
						ilike(tools.name, searchTerm),
						ilike(tools.description, searchTerm),
					),
				)
				.orderBy(desc(tools.createdAt))
				.limit(Math.floor(limit / 3) + 1);

			// Search public projects
			const projectResults = await db
				.select({
					id: projects.id,
					name: projects.name,
					description: projects.description,
					slug: projects.slug,
					visibility: projects.visibility,
					createdAt: projects.createdAt,
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
					and(
						eq(projects.visibility, "public"),
						or(
							ilike(projects.name, searchTerm),
							ilike(projects.description, searchTerm),
						),
					),
				)
				.orderBy(desc(projects.createdAt))
				.limit(Math.floor(limit / 3) + 1);

			// Combine results and sort by relevance/date
			const allResults = [
				...componentResults.map((r) => ({
					...r,
					type: "component" as const,
					score: 1,
				})),
				...toolResults.map((r) => ({ ...r, type: "tool" as const, score: 1 })),
				...projectResults.map((r) => ({
					...r,
					type: "project" as const,
					score: 1,
				})),
			]
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.slice(0, limit);

			return {
				results: allResults,
				total: allResults.length,
				components: componentResults.length,
				tools: toolResults.length,
				projects: projectResults.length,
			};
		}),

	// Search components with enhanced results
	components: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				categoryId: z.string().uuid().optional(),
				limit: z.number().int().min(1).max(100).default(20),
				offset: z.number().int().min(0).default(0),
			}),
		)
		.query(async ({ input }) => {
			const { query, categoryId, limit, offset } = input;
			const searchTerm = `%${query}%`;

			// Build WHERE conditions
			const whereConditions = [
				or(
					ilike(components.name, searchTerm),
					ilike(components.description, searchTerm),
				),
			];

			let baseQuery = db
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
					creator: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					},
				})
				.from(components)
				.leftJoin(user, eq(components.creatorId, user.id));

			if (categoryId) {
				baseQuery = baseQuery.innerJoin(
					componentCategories,
					and(
						eq(componentCategories.componentId, components.id),
						eq(componentCategories.categoryId, categoryId),
					),
				);
			}

			const results = await baseQuery
				.where(and(...whereConditions))
				.orderBy(desc(components.createdAt))
				.limit(limit)
				.offset(offset);

			// Batch fetch categories and stats to avoid N+1 queries
			const componentIds = results.map((r) => r.id);

			// Batch fetch categories
			const allCategories = await db
				.select({
					componentId: componentCategories.componentId,
					category: categories,
				})
				.from(componentCategories)
				.leftJoin(categories, eq(componentCategories.categoryId, categories.id))
				.where(inArray(componentCategories.componentId, componentIds));

			// Batch fetch star counts
			const starCounts = await db
				.select({
					itemId: stars.itemId,
					count: count(),
				})
				.from(stars)
				.where(
					and(
						eq(stars.itemType, "component"),
						inArray(stars.itemId, componentIds),
					),
				)
				.groupBy(stars.itemId);

			// Map the data
			const componentsWithDetails = results.map((component) => {
				const cats = allCategories.filter(
					(c) => c.componentId === component.id,
				);
				const starCount = starCounts.find((s) => s.itemId === component.id);
				return {
					...component,
					categories: cats.map((c) => c.category).filter(Boolean),
					starsCount: starCount?.count || 0,
					githubUrl: component.repoUrl,
					isStarred: false,
					forksCount: 0,
					issuesCount: 0,
					watchersCount: 0,
					readme: null,
					exampleCode: null,
					previewUrl: null,
				};
			});

			return {
				components: componentsWithDetails,
				total: componentsWithDetails.length,
			};
		}),

	// Search suggestions for autocomplete
	suggestions: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().int().min(1).max(10).default(5),
			}),
		)
		.query(async ({ input }) => {
			const { query, limit } = input;
			const searchTerm = `%${query}%`;

			// Get top component names
			const componentNames = await db
				.select({ name: components.name })
				.from(components)
				.where(ilike(components.name, searchTerm))
				.limit(limit);

			// Get top tool names
			const toolNames = await db
				.select({ name: tools.name })
				.from(tools)
				.where(ilike(tools.name, searchTerm))
				.limit(limit);

			// Get top project names
			const projectNames = await db
				.select({ name: projects.name })
				.from(projects)
				.where(
					and(
						eq(projects.visibility, "public"),
						ilike(projects.name, searchTerm),
					),
				)
				.limit(limit);

			const suggestions = [
				...componentNames.map((c) => c.name),
				...toolNames.map((t) => t.name),
				...projectNames.map((p) => p.name),
			]
				.filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
				.slice(0, limit);

			return suggestions;
		}),
});
