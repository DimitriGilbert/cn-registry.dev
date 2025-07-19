"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentCard } from "@/components/features/component-card";
import { SearchBar } from "@/components/features/search-bar";
import { ToolCard } from "@/components/features/tool-card";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { ThemeButtons } from "@/components/theme-buttons";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function HomePage() {
	const router = useRouter();

	// Fetch latest components
	const { data: latestComponents, isLoading: isLatestLoading } = useQuery(
		trpc.components.getAll.queryOptions({
			page: 1,
			limit: 4,
		}),
	);

	// Fetch trending/popular components (sorted by stars)
	const { data: trendingComponents, isLoading: isTrendingLoading } = useQuery(
		trpc.components.getAll.queryOptions({
			page: 1,
			limit: 3,
		}),
	);

	// Fetch featured tools
	const { data: featuredTools, isLoading: isToolsLoading } = useQuery(
		trpc.tools.getAll.queryOptions({
			page: 1,
			limit: 3,
		}),
	);

	const handleSearch = (query: string) => {
		if (query.trim()) {
			router.push(`/search?q=${encodeURIComponent(query)}`);
		}
	};

	return (
		<Container>
			<div className="py-12">
				{/* Hero Section */}
				<div className="mb-16 space-y-6 text-center">
					<PageTitle
						title="cn-registry"
						subtitle="Discover and share shadcn/ui components and developer tools"
					/>
					<div className="mx-auto max-w-md">
						<SearchBar
							placeholder="Search components and tools..."
							onSearch={handleSearch}
							suggestions={["data table", "form", "chart", "calendar", "cli"]}
						/>
					</div>
				</div>

				{/* Theme Buttons */}
				<div className="mb-16 text-center">
					<h3 className="mb-6 font-bold text-2xl">Elevate Your Design Instantly</h3>
					<ThemeButtons />
				</div>

				{/* Latest Components */}
				<section className="mb-16">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-primary" />
							<h2 className="font-bold text-2xl">Latest Components</h2>
						</div>
						<Button variant="outline" asChild>
							<Link href="/components">
								<span className="flex items-center gap-2">
									View All
									<ArrowRight className="h-4 w-4" />
								</span>
							</Link>
						</Button>
					</div>
					{isLatestLoading ? (
						<div className="flex gap-4 overflow-hidden">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="min-w-[300px] space-y-3">
									<Skeleton className="h-[200px] w-full rounded-xl" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-[250px]" />
										<Skeleton className="h-4 w-[200px]" />
									</div>
								</div>
							))}
						</div>
					) : (latestComponents?.components?.length ?? 0) > 0 ? (
						<Carousel>
							{latestComponents?.components?.map((component) => (
								<div key={component.id} className="min-w-[300px]">
									<ComponentCard {...component} />
								</div>
							))}
						</Carousel>
					) : (
						<div className="py-12 text-center">
							<p className="text-muted-foreground">
								No components available yet.
							</p>
							<Button variant="outline" className="mt-4" asChild>
								<Link href="/components">Browse Components</Link>
							</Button>
						</div>
					)}
				</section>

				{/* Trending Components */}
				<section className="mb-16">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-primary" />
							<h2 className="font-bold text-2xl">Popular Components</h2>
						</div>
						<Button variant="outline" asChild>
							<Link href="/components?sort=stars">
								<span className="flex items-center gap-2">
									View All
									<ArrowRight className="h-4 w-4" />
								</span>
							</Link>
						</Button>
					</div>
					{isTrendingLoading ? (
						<div className="flex gap-4 overflow-hidden">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="min-w-[300px] space-y-3">
									<Skeleton className="h-[200px] w-full rounded-xl" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-[250px]" />
										<Skeleton className="h-4 w-[200px]" />
									</div>
								</div>
							))}
						</div>
					) : (trendingComponents?.components?.length ?? 0) > 0 ? (
						<Carousel>
							{trendingComponents?.components?.map((component) => (
								<div key={component.id} className="min-w-[300px]">
									<ComponentCard {...component} />
								</div>
							))}
						</Carousel>
					) : (
						<div className="py-12 text-center">
							<p className="text-muted-foreground">
								No popular components available yet.
							</p>
						</div>
					)}
				</section>

				{/* Featured Tools */}
				<section>
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-primary" />
							<h2 className="font-bold text-2xl">Featured Tools</h2>
						</div>
						<Button variant="outline" asChild>
							<Link href="/tools">
								<span className="flex items-center gap-2">
									View All
									<ArrowRight className="h-4 w-4" />
								</span>
							</Link>
						</Button>
					</div>
					{isToolsLoading ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="space-y-3">
									<Skeleton className="h-[200px] w-full rounded-xl" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-[250px]" />
										<Skeleton className="h-4 w-[200px]" />
									</div>
								</div>
							))}
						</div>
					) : (featuredTools?.tools?.length ?? 0) > 0 ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{featuredTools?.tools?.map((tool) => (
								<ToolCard key={tool.id} {...tool} />
							))}
						</div>
					) : (
						<div className="py-12 text-center">
							<p className="text-muted-foreground">No tools available yet.</p>
							<Button variant="outline" className="mt-4" asChild>
								<Link href="/tools">Browse Tools</Link>
							</Button>
						</div>
					)}
				</section>
			</div>
		</Container>
	);
}
