import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import Providers from "@/components/providers";
import { ThemeScript } from "@/components/theme-script";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NODE_ENV === "production" 
	? "https://cn-registry.dev" 
	: "http://localhost:3001";

export const metadata: Metadata = {
	title: "cn-registry - shadcn/ui Component Registry",
	description: "Discover and share shadcn/ui components and developer tools",
	metadataBase: new URL(baseUrl),
	openGraph: {
		title: "cn-registry - shadcn/ui Component Registry",
		description: "Discover, share, and build with shadcn/ui components and tools. A central hub for the developer community.",
		url: baseUrl,
		siteName: "cn-registry",
		images: [
			{
				url: "/images/opengraph.jpg",
				width: 1200,
				height: 630,
				alt: "cn-registry - shadcn/ui Component Registry",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "cn-registry - shadcn/ui Component Registry",
		description: "Discover, share, and build with shadcn/ui components and tools. A central hub for the developer community.",
		images: ["/images/opengraph.jpg"],
	},
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
				<meta property="og:url" content={baseUrl} />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="cn-registry - shadcn/ui Component Registry" />
				<meta property="og:description" content="Discover, share, and build with shadcn/ui components and tools. A central hub for the developer community." />
				<meta property="og:image" content={`${baseUrl}/images/opengraph.jpg`} />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:image:alt" content="cn-registry - shadcn/ui Component Registry" />
				<meta property="og:site_name" content="cn-registry" />
				<meta property="og:locale" content="en_US" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="cn-registry - shadcn/ui Component Registry" />
				<meta name="twitter:description" content="Discover, share, and build with shadcn/ui components and tools. A central hub for the developer community." />
				<meta name="twitter:image" content={`${baseUrl}/images/opengraph.jpg`} />
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
