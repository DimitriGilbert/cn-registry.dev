import "server-only";
import type { RouterInputs, RouterOutputs } from "./trpc";

// Server-side data fetching using HTTP requests to the tRPC API
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://api.cn-registry.dev";

async function fetchFromTRPC(path: string, input?: unknown): Promise<unknown> {
	const url = `${SERVER_URL}/trpc`;
	
	// Use tRPC batch format
	const body = JSON.stringify({
		0: {
			id: null,
			method: "query",
			params: {
				path,
				input: input || null,
			},
		},
	});
	
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body,
	});

	if (!response.ok) {
		throw new Error(`tRPC request failed: ${response.status} ${response.statusText}`);
	}

	try {
		const data = await response.json();
		if (!data || !Array.isArray(data) || !data[0]?.result) {
			throw new Error('Invalid tRPC response structure');
		}
		return data[0].result.data;
	} catch (error) {
		throw new Error(`Failed to parse tRPC response: ${error}`);
	}
}

// Server caller that makes HTTP requests instead of direct procedure calls
export const serverCaller = {
	components: {
		getAll: (input?: RouterInputs["components"]["getAll"]): Promise<RouterOutputs["components"]["getAll"]> => 
			fetchFromTRPC("components.getAll", input) as Promise<RouterOutputs["components"]["getAll"]>,
		getById: (input: RouterInputs["components"]["getById"]): Promise<RouterOutputs["components"]["getById"]> => 
			fetchFromTRPC("components.getById", input) as Promise<RouterOutputs["components"]["getById"]>,
	},
	tools: {
		getAll: (input?: RouterInputs["tools"]["getAll"]): Promise<RouterOutputs["tools"]["getAll"]> => 
			fetchFromTRPC("tools.getAll", input) as Promise<RouterOutputs["tools"]["getAll"]>,
		getById: (input: RouterInputs["tools"]["getById"]): Promise<RouterOutputs["tools"]["getById"]> => 
			fetchFromTRPC("tools.getById", input) as Promise<RouterOutputs["tools"]["getById"]>,
	},
	creators: {
		search: (input?: RouterInputs["creators"]["search"]): Promise<RouterOutputs["creators"]["search"]> => 
			fetchFromTRPC("creators.search", input) as Promise<RouterOutputs["creators"]["search"]>,
		getTrending: (input?: RouterInputs["creators"]["getTrending"]): Promise<RouterOutputs["creators"]["getTrending"]> => 
			fetchFromTRPC("creators.getTrending", input) as Promise<RouterOutputs["creators"]["getTrending"]>,
		getByUsername: (input: RouterInputs["creators"]["getByUsername"]): Promise<RouterOutputs["creators"]["getByUsername"]> => 
			fetchFromTRPC("creators.getByUsername", input) as Promise<RouterOutputs["creators"]["getByUsername"]>,
	},
	categories: {
		getAll: (): Promise<RouterOutputs["categories"]["getAll"]> => 
			fetchFromTRPC("categories.getAll") as Promise<RouterOutputs["categories"]["getAll"]>,
	},
	projects: {
		getBySlug: (input: RouterInputs["projects"]["getBySlug"]): Promise<RouterOutputs["projects"]["getBySlug"]> => 
			fetchFromTRPC("projects.getBySlug", input) as Promise<RouterOutputs["projects"]["getBySlug"]>,
	},
};
