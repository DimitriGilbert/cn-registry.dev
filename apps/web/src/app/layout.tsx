import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import Providers from "@/components/providers";
import { ThemeScript } from "@/components/theme-script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "cn-registry - shadcn/ui Component Registry",
	description: "Discover and share shadcn/ui components and developer tools",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ThemeScript />
				<script
					src="https://cdn.counter.dev/script.js"
					data-id="154c6878-7558-4eff-90f9-bd4904015df1"
					data-utcoffset="1"
					async
				/>
			</head>
			<body className={inter.className}>
				<Providers>
					<AppShell>{children}</AppShell>
				</Providers>
			</body>
		</html>
	);
}
