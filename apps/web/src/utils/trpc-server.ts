import "server-only";

// Server-side data fetching using HTTP requests to the tRPC API
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

async function fetchFromTRPC(path: string, input?: any) {
	const url = `${SERVER_URL}/trpc/${path}`;
	const params = new URLSearchParams();
	params.set('input', JSON.stringify(input || {}));
	const fullUrl = `${url}?${params.toString()}`;
	
	const response = await fetch(fullUrl, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`tRPC request failed: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data.result.data;
}

// Server caller that makes HTTP requests instead of direct procedure calls
export const serverCaller = {
	components: {
		getAll: (input?: any) => fetchFromTRPC("components.getAll", input),
		getById: (input: { id: string }) => fetchFromTRPC("components.getById", input),
	},
	tools: {
		getAll: (input?: any) => fetchFromTRPC("tools.getAll", input),
		getById: (input: { id: string }) => fetchFromTRPC("tools.getById", input),
	},
	creators: {
		search: (input?: any) => fetchFromTRPC("creators.search", input),
		getTrending: (input?: any) => fetchFromTRPC("creators.getTrending", input),
		getByUsername: (input: { username: string }) => fetchFromTRPC("creators.getByUsername", input),
	},
	categories: {
		getAll: () => fetchFromTRPC("categories.getAll"),
	},
	projects: {
		getBySlug: (input: { slug: string }) => fetchFromTRPC("projects.getBySlug", input),
	},
};
