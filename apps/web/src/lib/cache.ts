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
export const getCachedComponents = async (
  options: Parameters<typeof serverCaller.components.getAll>[0] = {}
): Promise<RouterOutputs["components"]["getAll"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["components"]["getAll"]> => {
      return await serverCaller.components.getAll(options);
    },
    ["components", "getAll", JSON.stringify(options)],
    {
      tags: [CACHE_TAGS.components.list],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    const result = await cachedFn();
    // console.log("✅ CACHE SUCCESS - returning cached result");
    return result;
  } catch (error) {
    console.error(
      "❌ CACHE FAILED - bypassing cache:",
      (error as Error).message
    );
    // Don't cache errors - call directly
    const directResult = await serverCaller.components.getAll(options);
    console.log("✅ DIRECT SUCCESS - returning fresh result");
    return directResult;
  }
};

export const getCachedComponentById = async (
  id: string
): Promise<RouterOutputs["components"]["getById"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["components"]["getById"]> => {
      return await serverCaller.components.getById({ id });
    },
    ["components", "getById", id],
    {
      tags: [CACHE_TAGS.components.byId(id)],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error(`Failed to fetch cached component ${id}:`, error);
    // Don't cache errors - call directly
    return await serverCaller.components.getById({ id });
  }
};

export const getCachedTools = async (
  options: Parameters<typeof serverCaller.tools.getAll>[0] = {}
): Promise<RouterOutputs["tools"]["getAll"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["tools"]["getAll"]> => {
      return await serverCaller.tools.getAll(options);
    },
    ["tools", "getAll", JSON.stringify(options)],
    {
      tags: [CACHE_TAGS.tools.list],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error("Failed to fetch cached tools:", error);
    // Don't cache errors - call directly
    return await serverCaller.tools.getAll(options);
  }
};

export const getCachedToolById = async (
  id: string
): Promise<RouterOutputs["tools"]["getById"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["tools"]["getById"]> => {
      return await serverCaller.tools.getById({ id });
    },
    ["tools", "getById", id],
    {
      tags: [CACHE_TAGS.tools.byId(id)],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error(`Failed to fetch cached tool ${id}:`, error);
    // Don't cache errors - call directly
    return await serverCaller.tools.getById({ id });
  }
};

export const getCachedCreators = async (
  options: Parameters<typeof serverCaller.creators.search>[0] = {}
): Promise<RouterOutputs["creators"]["search"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["creators"]["search"]> => {
      return await serverCaller.creators.search(options);
    },
    ["creators", "search", JSON.stringify(options)],
    {
      tags: [CACHE_TAGS.creators.list],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error("Failed to fetch cached creators:", error);
    // Don't cache errors - call directly
    return await serverCaller.creators.search(options);
  }
};

export const getCachedTrendingCreators = async (
  options: Parameters<typeof serverCaller.creators.getTrending>[0] = {}
): Promise<RouterOutputs["creators"]["getTrending"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["creators"]["getTrending"]> => {
      return await serverCaller.creators.getTrending(options);
    },
    ["creators", "getTrending", JSON.stringify(options)],
    {
      tags: [CACHE_TAGS.creators.trending],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error("Failed to fetch cached trending creators:", error);
    // Don't cache errors - call directly
    return await serverCaller.creators.getTrending(options);
  }
};

export const getCachedCreatorByUsername = async (
  username: string
): Promise<RouterOutputs["creators"]["getByUsername"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["creators"]["getByUsername"]> => {
      return await serverCaller.creators.getByUsername({ username });
    },
    ["creators", "getByUsername", username],
    {
      tags: [CACHE_TAGS.creators.byUsername(username)],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error(`Failed to fetch cached creator ${username}:`, error);
    // Don't cache errors - call directly
    return await serverCaller.creators.getByUsername({ username });
  }
};

export const getCachedCategories = async (): Promise<
  RouterOutputs["categories"]["getAll"]
> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["categories"]["getAll"]> => {
      return await serverCaller.categories.getAll();
    },
    ["categories", "getAll"],
    {
      tags: [CACHE_TAGS.categories.list],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error("Failed to fetch cached categories:", error);
    // Don't cache errors - call directly
    return await serverCaller.categories.getAll();
  }
};

// Note: projects.getAll is protected and requires auth, so we don't cache it for RSC

export const getCachedProjectBySlug = async (
  slug: string
): Promise<RouterOutputs["projects"]["getBySlug"]> => {
  const cachedFn = unstable_cache(
    async (): Promise<RouterOutputs["projects"]["getBySlug"]> => {
      return await serverCaller.projects.getBySlug({ slug });
    },
    ["projects", "getBySlug", slug],
    {
      tags: [CACHE_TAGS.projects.bySlug(slug)],
      revalidate: DEFAULT_REVALIDATE,
    }
  );

  try {
    return await cachedFn();
  } catch (error) {
    console.error(`Failed to fetch cached project ${slug}:`, error);
    // Don't cache errors - call directly
    return await serverCaller.projects.getBySlug({ slug });
  }
};

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
