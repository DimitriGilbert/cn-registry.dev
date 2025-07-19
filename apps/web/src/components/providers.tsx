"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/utils/trpc";
import { CartProvider } from "./providers/cart-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<CartProvider>
					{children}
					<ReactQueryDevtools />
				</CartProvider>
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
