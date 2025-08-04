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
	) => {
		return serverCaller.components.getAll(options);
	},
	["components", "getAll"],
	{
		tags: [CACHE_TAGS.components.list],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedComponentById = unstable_cache(
	async (id: string) => {
		return serverCaller.components.getById({ id });
	},
	["components", "getById"],
	{
		tags: [CACHE_TAGS.components.byId("__id__")],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedTools = unstable_cache(
	async (options: Parameters<typeof serverCaller.tools.getAll>[0] = {}) => {
		return serverCaller.tools.getAll(options);
	},
	["tools", "getAll"],
	{
		tags: [CACHE_TAGS.tools.list],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedToolById = unstable_cache(
	async (id: string) => {
		return serverCaller.tools.getById({ id });
	},
	["tools", "getById"],
	{
		tags: [CACHE_TAGS.tools.byId("__id__")],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedCreators = unstable_cache(
	async (options: Parameters<typeof serverCaller.creators.search>[0] = {}) => {
		return serverCaller.creators.search(options);
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
	) => {
		return serverCaller.creators.getTrending(options);
	},
	["creators", "getTrending"],
	{
		tags: [CACHE_TAGS.creators.trending],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedCreatorByUsername = unstable_cache(
	async (username: string) => {
		return serverCaller.creators.getByUsername({ username });
	},
	["creators", "getByUsername"],
	{
		tags: [CACHE_TAGS.creators.byUsername("__username__")],
		revalidate: DEFAULT_REVALIDATE,
	},
);

export const getCachedCategories = unstable_cache(
	async () => {
		return serverCaller.categories.getAll();
	},
	["categories", "getAll"],
	{
		tags: [CACHE_TAGS.categories.list],
		revalidate: DEFAULT_REVALIDATE,
	},
);

// Note: projects.getAll is protected and requires auth, so we don't cache it for RSC

export const getCachedProjectBySlug = unstable_cache(
	async (slug: string) => {
		return serverCaller.projects.getBySlug({ slug });
	},
	["projects", "getBySlug"],
	{
		tags: [CACHE_TAGS.projects.bySlug("__slug__")],
		revalidate: DEFAULT_REVALIDATE,
	},
);

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
