import { revalidateTag, unstable_cache } from "next/cache";
import type { RouterOutputs } from "@/utils/trpc";
import { serverCaller } from "@/utils/trpc-server";

// Cache configuration
const DEFAULT_REVALIDATE = 900; // 15 minutes

// Cache tags for different entity types
export const CACHE_TAGS = {
	components: {
		list: "components:list",
		byId: (id: string) => `component:${id}`,
		bySlug: (slug: string) => `component:${slug}`,
	},
	tools: {
		list: "tools:list",
		byId: (id: string) => `tool:${id}`,
	},
	creators: {
		list: "creators:list",
		trending: "creators:trending",
		byUsername: (username: string) => `creator:${username}`,
	},
	categories: {
		list: "categories:list",
	},
	projects: {
		list: "projects:list",
		bySlug: (slug: string) => `project:${slug}`,
	},
} as const;

// Cached data fetchers
export const getCachedComponents = unstable_cache(
	async (
		options: Parameters<typeof serverCaller.components.getAll>[0] = {},
	): Promise<RouterOutputs["components"]["getAll"]> => {
		try {
			return await serverCaller.components.getAll(options);
		} catch (error) {
			console.error("Failed to fetch cached components:", error);
			throw error;
		}
	},
	["components", "getAll"],
	{
		tags: [CACHE_TAGS.components.list],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedComponentById = (id: string) => 
	unstable_cache(
		async (): Promise<RouterOutputs["components"]["getById"]> => {
			try {
				return await serverCaller.components.getById({ id });
			} catch (error) {
				console.error(`Failed to fetch cached component ${id}:`, error);
				throw error;
			}
		},
		["components", "getById", id],
		{
			tags: [CACHE_TAGS.components.byId(id)],
			revalidate: DEFAULT_REVALIDATE,
		},
	)();

export const getCachedTools = unstable_cache(
	async (options: Parameters<typeof serverCaller.tools.getAll>[0] = {}): Promise<RouterOutputs["tools"]["getAll"]> => {
		try {
			return await serverCaller.tools.getAll(options);
		} catch (error) {
			console.error("Failed to fetch cached tools:", error);
			throw error;
		}
	},
	["tools", "getAll"],
	{
		tags: [CACHE_TAGS.tools.list],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedToolById = (id: string) => 
	unstable_cache(
		async (): Promise<RouterOutputs["tools"]["getById"]> => {
			try {
				return await serverCaller.tools.getById({ id });
			} catch (error) {
				console.error(`Failed to fetch cached tool ${id}:`, error);
				throw error;
			}
		},
		["tools", "getById", id],
		{
			tags: [CACHE_TAGS.tools.byId(id)],
			revalidate: DEFAULT_REVALIDATE,
		},
	)();

export const getCachedCreators = unstable_cache(
	async (options: Parameters<typeof serverCaller.creators.search>[0] = {}): Promise<RouterOutputs["creators"]["search"]> => {
		try {
			return await serverCaller.creators.search(options);
		} catch (error) {
			console.error("Failed to fetch cached creators:", error);
			throw error;
		}
	},
	["creators", "search"],
	{
		tags: [CACHE_TAGS.creators.list],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedTrendingCreators = unstable_cache(
	async (
		options: Parameters<typeof serverCaller.creators.getTrending>[0] = {},
	): Promise<RouterOutputs["creators"]["getTrending"]> => {
		try {
			return await serverCaller.creators.getTrending(options);
		} catch (error) {
			console.error("Failed to fetch cached trending creators:", error);
			throw error;
		}
	},
	["creators", "getTrending"],
	{
		tags: [CACHE_TAGS.creators.trending],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedCreatorByUsername = (username: string) => 
	unstable_cache(
		async (): Promise<RouterOutputs["creators"]["getByUsername"]> => {
			try {
				return await serverCaller.creators.getByUsername({ username });
			} catch (error) {
				console.error(`Failed to fetch cached creator ${username}:`, error);
				throw error;
			}
		},
		["creators", "getByUsername", username],
		{
			tags: [CACHE_TAGS.creators.byUsername(username)],
			revalidate: DEFAULT_REVALIDATE,
		},
	)();

export const getCachedCategories = unstable_cache(
	async (): Promise<RouterOutputs["categories"]["getAll"]> => {
		try {
			return await serverCaller.categories.getAll();
		} catch (error) {
			console.error("Failed to fetch cached categories:", error);
			throw error;
		}
	},
	["categories", "getAll"],
	{
		tags: [CACHE_TAGS.categories.list],
		revalidate: DEFAULT_REVALIDATE,
	},
);

// Note: projects.getAll is protected and requires auth, so we don't cache it for RSC

export const getCachedProjectBySlug = (slug: string) => 
	unstable_cache(
		async (): Promise<RouterOutputs["projects"]["getBySlug"]> => {
			try {
				return await serverCaller.projects.getBySlug({ slug });
			} catch (error) {
				console.error(`Failed to fetch cached project ${slug}:`, error);
				throw error;
			}
		},
		["projects", "getBySlug", slug],
		{
			tags: [CACHE_TAGS.projects.bySlug(slug)],
			revalidate: DEFAULT_REVALIDATE,
		},
	)();

// Cache invalidation helpers
export function invalidateComponents() {
	revalidateTag(CACHE_TAGS.components.list);
}

export function invalidateComponent(id: string) {
	revalidateTag(CACHE_TAGS.components.byId(id));
}

export function invalidateTools() {
	revalidateTag(CACHE_TAGS.tools.list);
}

export function invalidateTool(id: string) {
	revalidateTag(CACHE_TAGS.tools.byId(id));
}

export function invalidateCreators() {
	revalidateTag(CACHE_TAGS.creators.list);
	revalidateTag(CACHE_TAGS.creators.trending);
}

export function invalidateCreator(username: string) {
	revalidateTag(CACHE_TAGS.creators.byUsername(username));
}

export function invalidateCategories() {
	revalidateTag(CACHE_TAGS.categories.list);
}

// Note: projects.getAll is protected, so we don't have a general invalidateProjects function

export function invalidateProject(slug: string) {
	revalidateTag(CACHE_TAGS.projects.bySlug(slug));
}
