"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ComponentCard } from "@/components/features/component-card";
import { FilterPanel } from "@/components/features/filter-panel";
import { SearchBar } from "@/components/features/search-bar";
import { ToolCard } from "@/components/features/tool-card";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";

export default function SearchPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [activeTab, setActiveTab] = useState("components");
	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 12;

	// Fetch categories for filtering
	const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());

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

	const components = componentsData?.components || [];
	const tools = toolsData?.tools || [];
	const totalComponents = componentsData?.totalCount || 0;
	const totalTools = toolsData?.totalCount || 0;
	const totalResults =
		activeTab === "components" ? totalComponents : totalTools;

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
				{ id: "component", label: "Component", count: totalComponents },
				{ id: "tool", label: "Tool", count: totalTools },
			],
		},
	];

	const handleFilterChange = (filters: string[]) => {
		// Simple approach: assume first filter is category, second is type
		const categoryFilter =
			filters.find((f) => categories?.some((cat) => cat.id === f)) || "";
		const typeFilter = filters.find((f) => ["component", "tool"].includes(f));

		setSelectedCategory(categoryFilter);
		if (typeFilter === "component" || typeFilter === "tool") {
			setActiveTab(typeFilter + "s"); // "component" -> "components", "tool" -> "tools"
		}
	};

	const selectedFilters = [selectedCategory].filter(Boolean);

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Search"
					subtitle="Find components and tools for your projects"
				/>

				<div className="mb-8 flex flex-col gap-6 lg:flex-row">
					<div className="flex-1">
						<SearchBar
							placeholder="Search components and tools..."
							onSearch={setSearchQuery}
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
					<TabsList className="grid w-full max-w-md grid-cols-2">
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
