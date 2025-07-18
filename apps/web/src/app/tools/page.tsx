"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FilterPanel } from "@/components/features/filter-panel";
import { SearchBar } from "@/components/features/search-bar";
import { ToolCard } from "@/components/features/tool-card";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function ToolsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [sortBy, setSortBy] = useState("latest");
	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 12;

	// Fetch categories for filtering
	const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());

	// Fetch tools with current filters
	const {
		data: toolsData,
		isLoading,
		error,
	} = useQuery(
		trpc.tools.getAll.queryOptions({
			query: searchQuery || undefined,
			categoryId: selectedCategory || undefined,
			page: currentPage,
			limit: itemsPerPage,
		}),
	);

	// Reset page when search or filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedCategory]);

	const tools = toolsData?.tools || [];
	const totalCount = toolsData?.totalCount || 0;
	const totalPages = Math.ceil(totalCount / itemsPerPage);

	// Build filter groups from categories
	const filterGroups = categories
		? [
				{
					id: "category",
					label: "Category",
					options: categories.map((cat) => ({
						id: cat.id,
						label: cat.name,
						count: cat.toolCount || 0,
					})),
				},
			]
		: [];

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Developer Tools"
					subtitle="Discover tools to enhance your shadcn/ui workflow"
				/>

				<div className="mb-8 flex flex-col gap-6 lg:flex-row">
					<div className="flex-1">
						<SearchBar
							placeholder="Search tools..."
							onSearch={setSearchQuery}
							suggestions={["cli", "theme", "storybook", "vscode"]}
						/>
					</div>
					<div className="flex items-center gap-4">
						<FilterPanel
							filterGroups={filterGroups}
							selectedFilters={selectedCategory ? [selectedCategory] : []}
							onFiltersChange={(filters) =>
								setSelectedCategory(filters[0] || "")
							}
						/>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="latest">Latest</SelectItem>
								<SelectItem value="stars">Most Stars</SelectItem>
								<SelectItem value="downloads">Most Downloads</SelectItem>
								<SelectItem value="name">Name</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{isLoading ? (
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
				) : error ? (
					<div className="py-12 text-center">
						<p className="text-destructive">
							Error loading tools. Please try again.
						</p>
					</div>
				) : (
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tools.map((tool) => (
							<ToolCard key={tool.id} {...tool} />
						))}
					</div>
				)}

				{totalPages > 1 && (
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
								/>
							</PaginationItem>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<PaginationItem key={page}>
										<PaginationLink
											href="#"
											isActive={page === currentPage}
											onClick={() => setCurrentPage(page)}
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								),
							)}
							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={() =>
										setCurrentPage(Math.min(totalPages, currentPage + 1))
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}

				{!isLoading && !error && tools.length === 0 && (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							No tools found matching your criteria.
						</p>
					</div>
				)}
			</div>
		</Container>
	);
}
