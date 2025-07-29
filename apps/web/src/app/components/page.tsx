"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ComponentCard } from "@/components/features/component-card";
import { FilterPanel } from "@/components/features/filter-panel";
import { SearchBar } from "@/components/features/search-bar";
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

export default function ComponentsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [sortBy, setSortBy] = useState("latest");
	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 12;

	// Fetch categories for filtering
	const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());

	// Fetch components with current filters
	const {
		data: componentsData,
		isLoading,
		error,
	} = useQuery(
		trpc.components.getAll.queryOptions({
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

	const components = componentsData?.components || [];
	const totalCount = componentsData?.totalCount || 0;
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
						count: cat.componentCount || 0,
					})),
				},
			]
		: [];

	return (
		<Container>
			<div className="py-12">
				<PageTitle
					title="Components"
					subtitle="Discover and explore beautiful shadcn/ui components for your projects"
				/>

				{/* Enhanced Search and Filter Section */}
				<div className="mb-12 space-y-6">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl" />
						<div className="relative bg-card/50 backdrop-blur-sm border rounded-2xl p-6 shadow-sm">
							<div className="flex flex-col gap-6 lg:flex-row lg:items-end">
								<div className="flex-1">
									<SearchBar
										placeholder="Search components..."
										onSearch={setSearchQuery}
										suggestions={["data table", "form", "chart", "calendar"]}
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
										<SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm">
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
						</div>
					</div>

					{/* Results Summary */}
					{!isLoading && !error && (
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<p>
								{components.length > 0 
									? `Showing ${components.length} of ${totalCount} components`
									: "No components found"
								}
								{searchQuery && ` for "${searchQuery}"`}
								{selectedCategory && categories && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
							</p>
							{totalCount > 0 && (
								<p>Page {currentPage} of {totalPages}</p>
							)}
						</div>
					)}
				</div>

				{isLoading ? (
					<div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={`component-skeleton-${i}`} className="space-y-4">
								<Skeleton className="h-[240px] w-full rounded-2xl" />
								<div className="space-y-3 px-2">
									<Skeleton className="h-5 w-[250px]" />
									<Skeleton className="h-4 w-[200px]" />
									<div className="flex gap-2">
										<Skeleton className="h-6 w-16 rounded-full" />
										<Skeleton className="h-6 w-20 rounded-full" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : error ? (
					<div className="py-24 text-center">
						<div className="mx-auto max-w-md space-y-4">
							<div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
								<svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
							</div>
							<div>
								<h3 className="font-semibold text-lg mb-1">Failed to load components</h3>
								<p className="text-muted-foreground">
									Something went wrong. Please try refreshing the page.
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{components.map((component, index) => (
							<div 
								key={component.id} 
								className="animate-in fade-in slide-in-from-bottom-4 duration-300"
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<ComponentCard {...component} />
							</div>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex justify-center">
						<Pagination>
							<PaginationContent className="bg-card/50 backdrop-blur-sm border rounded-lg p-2">
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
										className="hover:bg-primary/10"
									/>
								</PaginationItem>
								{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									let page: number;
									if (totalPages <= 5) {
										page = i + 1;
									} else if (currentPage <= 3) {
										page = i + 1;
									} else if (currentPage >= totalPages - 2) {
										page = totalPages - 4 + i;
									} else {
										page = currentPage - 2 + i;
									}
									return (
										<PaginationItem key={page}>
											<PaginationLink
												href="#"
												isActive={page === currentPage}
												onClick={() => setCurrentPage(page)}
												className="hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
											>
												{page}
											</PaginationLink>
										</PaginationItem>
									);
								}).filter(Boolean)}
								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={() =>
											setCurrentPage(Math.min(totalPages, currentPage + 1))
										}
										className="hover:bg-primary/10"
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				)}

				{!isLoading && !error && components.length === 0 && (
					<div className="py-24 text-center">
						<div className="mx-auto max-w-md space-y-6">
							<div className="mx-auto h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
								<svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<div>
								<h3 className="font-semibold text-xl mb-2">No components found</h3>
								<p className="text-muted-foreground mb-4">
									{searchQuery || selectedCategory 
										? "Try adjusting your search criteria or filters."
										: "It looks like there are no components available yet."
									}
								</p>
								{(searchQuery || selectedCategory) && (
									<button
										onClick={() => {
											setSearchQuery("");
											setSelectedCategory("");
										}}
										className="text-primary hover:text-primary/80 font-medium"
									>
										Clear all filters
									</button>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</Container>
	);
}
