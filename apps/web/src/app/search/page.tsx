"use client";

import { useQuery } from "@tanstack/react-query";
import { Component, FolderOpen, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ComponentCard } from "@/components/features/component-card";
import { FilterPanel } from "@/components/features/filter-panel";
import { SearchBar } from "@/components/features/search-bar";
import { ToolCard } from "@/components/features/tool-card";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";

export default function SearchPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const urlQuery = searchParams.get("q") || "";

	const [searchQuery, setSearchQuery] = useState(urlQuery);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [activeTab, setActiveTab] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);

	// Update search query when URL changes
	useEffect(() => {
		setSearchQuery(urlQuery);
	}, [urlQuery]);

	const itemsPerPage = 12;

	// Fetch categories for filtering
	const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());

	// Global search results for "all" tab
	const { data: globalSearchResults, isLoading: isGlobalLoading } = useQuery({
		...trpc.search.global.queryOptions({
			query: searchQuery,
			limit: 50,
		}),
		enabled: activeTab === "all" && searchQuery.length > 0,
	});

	// Fetch components with search and filters
	const { data: componentsData, isLoading: isComponentsLoading } = useQuery({
		...trpc.components.getAll.queryOptions({
			query: searchQuery || undefined,
			categoryId: selectedCategory || undefined,
			page: currentPage,
			limit: itemsPerPage,
		}),
		enabled: activeTab === "components",
	});

	// Fetch tools with search and filters
	const { data: toolsData, isLoading: isToolsLoading } = useQuery({
		...trpc.tools.getAll.queryOptions({
			query: searchQuery || undefined,
			categoryId: selectedCategory || undefined,
			page: currentPage,
			limit: itemsPerPage,
		}),
		enabled: activeTab === "tools",
	});

	// Reset page when search or filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedCategory, activeTab]);

	// Handle search input changes and update URL
	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		if (query) {
			router.push(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
		} else {
			router.push("/search", { scroll: false });
		}
	};

	const components = componentsData?.components || [];
	const tools = toolsData?.tools || [];
	const totalComponents = componentsData?.totalCount || 0;
	const totalTools = toolsData?.totalCount || 0;
	const globalTotal = globalSearchResults?.total || 0;
	const totalResults =
		activeTab === "all"
			? globalTotal
			: activeTab === "components"
				? totalComponents
				: totalTools;

	// Helper functions for global search results
	const getItemIcon = (type: string) => {
		switch (type) {
			case "component":
				return <Component className="h-5 w-5" />;
			case "tool":
				return <Wrench className="h-5 w-5" />;
			case "project":
				return <FolderOpen className="h-5 w-5" />;
			default:
				return <Search className="h-5 w-5" />;
		}
	};

	const renderGlobalSearchCard = (item: any) => {
		const href =
			item.type === "component"
				? `/components/${item.id}`
				: item.type === "tool"
					? `/tools/${item.id}`
					: `/projects/${"slug" in item ? item.slug : item.id}`;

		return (
			<Card key={`${item.type}-${item.id}`} className="h-full">
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2">
							{getItemIcon(item.type)}
							<div>
								<CardTitle className="text-lg">
									<Link href={href} className="hover:underline">
										{item.name}
									</Link>
								</CardTitle>
								<div className="mt-1 flex items-center gap-2">
									<Badge variant="secondary" className="text-xs">
										{item.type}
									</Badge>
									{item.type === "project" && "visibility" in item && (
										<Badge
											variant={
												item.visibility === "public" ? "default" : "outline"
											}
											className="text-xs"
										>
											{item.visibility}
										</Badge>
									)}
								</div>
							</div>
						</div>
					</div>
					<CardDescription className="mt-2 line-clamp-2">
						{item.description}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between text-muted-foreground text-sm">
						<div className="flex items-center gap-4">
							{item.creator && (
								<span>by {item.creator.name || item.creator.username}</span>
							)}
						</div>
						<div>{new Date(item.createdAt).toLocaleDateString()}</div>
					</div>
					<div className="mt-4">
						<Button asChild size="sm" className="w-full">
							<Link href={href}>View Details</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	};

	// Build filter groups from categories and type
	const filterGroups = [
		...(categories
			? [
					{
						id: "category",
						label: "Category",
						options: categories.map((cat) => ({
							id: cat.id,
							label: cat.name,
							count: (cat.componentCount || 0) + (cat.toolCount || 0),
						})),
					},
				]
			: []),
		{
			id: "type",
			label: "Type",
			options: [
				{ id: "all", label: "All", count: globalTotal },
				{ id: "component", label: "Component", count: totalComponents },
				{ id: "tool", label: "Tool", count: totalTools },
			],
		},
	];

	const handleFilterChange = (filters: string[]) => {
		// Simple approach: assume first filter is category, second is type
		const categoryFilter =
			filters.find((f) => categories?.some((cat) => cat.id === f)) || "";
		const typeFilter = filters.find((f) =>
			["all", "component", "tool"].includes(f),
		);

		setSelectedCategory(categoryFilter);
		if (typeFilter === "all") {
			setActiveTab("all");
		} else if (typeFilter === "component" || typeFilter === "tool") {
			setActiveTab(typeFilter + "s"); // "component" -> "components", "tool" -> "tools"
		}
	};

	const selectedFilters = [selectedCategory].filter(Boolean);

	// Show empty state when no search query
	if (!searchQuery) {
		return (
			<Container>
				<div className="py-8">
					<PageTitle
						title="Search"
						subtitle="Find components, tools, and projects"
					/>

					<div className="mb-8 flex flex-col gap-6 lg:flex-row">
						<div className="flex-1">
							<SearchBar
								placeholder="Search components, tools, and projects..."
								onSearch={handleSearchChange}
								suggestions={["data table", "form", "cli", "theme"]}
							/>
						</div>
						<FilterPanel
							filterGroups={filterGroups}
							selectedFilters={selectedFilters}
							onFiltersChange={handleFilterChange}
						/>
					</div>

					<div className="mt-8 text-center">
						<Search className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 font-semibold text-lg">Start searching</h3>
						<p className="mt-2 text-muted-foreground">
							Enter a search term above to find components, tools, and projects.
						</p>
						<div className="mt-4 flex justify-center gap-2">
							<Button asChild variant="outline">
								<Link href="/components">Browse Components</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/tools">Browse Tools</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/projects">Browse Projects</Link>
							</Button>
						</div>
					</div>
				</div>
			</Container>
		);
	}

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title={`Search Results for "${searchQuery}"`}
					subtitle={`Found ${totalResults} results`}
				/>

				<div className="mb-8 flex flex-col gap-6 lg:flex-row">
					<div className="flex-1">
						<SearchBar
							placeholder="Search components, tools, and projects..."
							onSearch={handleSearchChange}
							suggestions={["data table", "form", "cli", "theme"]}
						/>
					</div>
					<FilterPanel
						filterGroups={filterGroups}
						selectedFilters={selectedFilters}
						onFiltersChange={handleFilterChange}
					/>
				</div>

				{(searchQuery || selectedCategory) && (
					<div className="mb-6">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<span>Found {totalResults} results</span>
							{searchQuery && (
								<>
									<span>for</span>
									<Badge variant="outline">"{searchQuery}"</Badge>
								</>
							)}
							{selectedCategory && (
								<>
									<span>in</span>
									<Badge variant="outline">
										{categories?.find((c) => c.id === selectedCategory)?.name}
									</Badge>
								</>
							)}
						</div>
					</div>
				)}

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full max-w-lg grid-cols-3">
						<TabsTrigger value="all" className="flex items-center gap-2">
							All
							<Badge variant="secondary" className="text-xs">
								{globalTotal}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="components" className="flex items-center gap-2">
							Components
							<Badge variant="secondary" className="text-xs">
								{totalComponents}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="tools" className="flex items-center gap-2">
							Tools
							<Badge variant="secondary" className="text-xs">
								{totalTools}
							</Badge>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="mt-6">
						{isGlobalLoading ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton key={i} className="h-48" />
								))}
							</div>
						) : !globalSearchResults ||
							globalSearchResults.results.length === 0 ? (
							<div className="py-12 text-center">
								<Search className="mx-auto h-12 w-12 text-muted-foreground" />
								<h3 className="mt-4 font-semibold text-lg">No results found</h3>
								<p className="mt-2 text-muted-foreground">
									Try adjusting your search terms or browse our categories.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{globalSearchResults.results.map((item) =>
									renderGlobalSearchCard(item),
								)}
							</div>
						)}
					</TabsContent>

					<TabsContent value="components" className="mt-6">
						{isComponentsLoading ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className="space-y-3">
										<Skeleton className="h-[200px] w-full rounded-xl" />
										<div className="space-y-2">
											<Skeleton className="h-4 w-[250px]" />
											<Skeleton className="h-4 w-[200px]" />
										</div>
									</div>
								))}
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{components.map((component) => (
										<ComponentCard key={component.id} {...component} />
									))}
								</div>
								{components.length === 0 && (
									<div className="py-12 text-center">
										<p className="text-muted-foreground">
											No components found.
										</p>
									</div>
								)}
							</>
						)}
					</TabsContent>

					<TabsContent value="tools" className="mt-6">
						{isToolsLoading ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className="space-y-3">
										<Skeleton className="h-[200px] w-full rounded-xl" />
										<div className="space-y-2">
											<Skeleton className="h-4 w-[250px]" />
											<Skeleton className="h-4 w-[200px]" />
										</div>
									</div>
								))}
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{tools.map((tool) => (
										<ToolCard key={tool.id} {...tool} />
									))}
								</div>
								{tools.length === 0 && (
									<div className="py-12 text-center">
										<p className="text-muted-foreground">No tools found.</p>
									</div>
								)}
							</>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</Container>
	);
}
