"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { CollectionSection } from "@/components/features/collection-section";
import { SearchBar } from "@/components/features/search-bar";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { trpc } from "@/utils/trpc";

export default function HomePage() {
	const router = useRouter();

	// Fetch latest components
	const { data: latestComponents, isLoading: isLatestLoading } = useQuery(
		trpc.components.getAll.queryOptions({
			page: 1,
			limit: 10,
		}),
	);

	// Fetch trending/popular components (sorted by stars)
	const { data: trendingComponents, isLoading: isTrendingLoading } = useQuery(
		trpc.components.getAll.queryOptions({
			page: 1,
			limit: 10,
		}),
	);

	// Fetch featured tools
	const { data: featuredTools, isLoading: isToolsLoading } = useQuery(
		trpc.tools.getAll.queryOptions({
			page: 1,
			limit: 10,
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

				<CollectionSection
					title="Latest Components"
					icon={Clock}
					items={latestComponents?.components}
					isLoading={isLatestLoading}
					viewAllLink="/components"
					itemType="component"
					layout="carousel"
					skeletonCount={10}
				/>

				<CollectionSection
					title="Popular Components"
					icon={TrendingUp}
					items={trendingComponents?.components}
					isLoading={isTrendingLoading}
					viewAllLink="/components?sort=stars"
					itemType="component"
					layout="carousel"
					emptyMessage="No popular components available yet."
					skeletonCount={10}
				/>

				<CollectionSection
					title="Featured Tools"
					icon={Sparkles}
					items={featuredTools?.tools}
					isLoading={isToolsLoading}
					viewAllLink="/tools"
					itemType="tool"
					layout="carousel"
					skeletonCount={10}
				/>
			</div>
		</Container>
	);
}
