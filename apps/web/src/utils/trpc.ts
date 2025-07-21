import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";
import type { AppRouter } from "../../../server/src/routers";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

const getServerUrl = () => {
	// For server-side calls (SSR), use internal container URL
	if (typeof window === "undefined") {
		return (
			process.env.SERVER_URL ||
			process.env.NEXT_PUBLIC_SERVER_URL ||
			"https://api.cn-registry.dev"
		);
	}
	// For client-side calls, use public URL
	return process.env.NEXT_PUBLIC_SERVER_URL || "https://api.cn-registry.dev";
};

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${getServerUrl()}/trpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
