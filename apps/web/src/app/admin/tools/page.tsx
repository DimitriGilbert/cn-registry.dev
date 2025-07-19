"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BarChart3,
	Edit,
	Eye,
	MoreHorizontal,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FilterPanel } from "@/components/features/filter-panel";
import { SearchBar } from "@/components/features/search-bar";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { trpc, trpcClient } from "@/utils/trpc";

const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export default function ManageToolsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [currentPage, setCurrentPage] = useState(1);
	const queryClient = useQueryClient();

	const itemsPerPage = 10;

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

	// Delete tool mutation
	const deleteToolMutation = useMutation({
		mutationFn: async (id: string) => {
			const result = await trpcClient.tools.delete.mutate({ id });
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools", "getAll"] });
			toast.success("Tool deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete tool");
		},
	});

	// Reset page when search or filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedCategory]);

	const tools = toolsData?.tools || [];
	const totalCount = toolsData?.totalCount || 0;
	const totalPages = Math.ceil(totalCount / itemsPerPage);

	// Build filter groups from categories and status
	const filterGroups = [
		...(categories
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
			: []),
	];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "published":
				return <Badge variant="default">Published</Badge>;
			case "draft":
				return <Badge variant="secondary">Draft</Badge>;
			case "archived":
				return <Badge variant="outline">Archived</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const handleDelete = (id: string, name: string) => {
		if (confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteToolMutation.mutate(id);
		}
	};

	const handleFilterChange = (filters: string[]) => {
		const categoryFilter =
			filters.find((f) => categories?.some((cat) => cat.id === f)) || "";
		setSelectedCategory(categoryFilter);
	};

	const selectedFilters = [selectedCategory].filter(Boolean);

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Manage Tools"
					subtitle="View and manage all developer tools in the registry"
				>
					<Button asChild>
						<Link href="/admin/tools/new">
							<span className="flex items-center">
								<Plus className="mr-2 h-4 w-4" />
								Add Tool
							</span>
						</Link>
					</Button>
				</PageTitle>

				<div className="mb-8 flex flex-col gap-6 lg:flex-row">
					<div className="flex-1">
						<SearchBar
							placeholder="Search tools..."
							onSearch={setSearchQuery}
						/>
					</div>
					<FilterPanel
						filterGroups={filterGroups}
						selectedFilters={selectedFilters}
						onFiltersChange={handleFilterChange}
					/>
				</div>

				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Stars</TableHead>
								<TableHead>Creator</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-[100px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-4 w-[200px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[100px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[80px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[60px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[80px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[80px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[40px]" />
										</TableCell>
									</TableRow>
								))
							) : error ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="py-8 text-center text-destructive"
									>
										Error loading tools. Please try again.
									</TableCell>
								</TableRow>
							) : tools.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="py-8 text-center text-muted-foreground"
									>
										No tools found matching your criteria.
									</TableCell>
								</TableRow>
							) : (
								tools.map((tool) => (
									<TableRow key={tool.id}>
										<TableCell className="font-medium">
											<Link
												href={`/tools/${tool.id}`}
												className="hover:underline"
											>
												{tool.name}
											</Link>
										</TableCell>
										<TableCell>
											{tool.categories?.[0]?.name || "Uncategorized"}
										</TableCell>
										<TableCell>{formatDate(tool.createdAt)}</TableCell>
										<TableCell>{tool.starsCount || 0}</TableCell>
										<TableCell>{tool.creator?.name || "Unknown"}</TableCell>
										<TableCell>
											{getStatusBadge(tool.status || "published")}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem asChild>
														<Link href={`/tools/${tool.id}`}>
															<Eye className="mr-2 h-4 w-4" />
															View
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link href={`/admin/tools/${tool.id}/edit`}>
															<Edit className="mr-2 h-4 w-4" />
															Edit
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link href={`/admin/tools/${tool.id}/analytics`}>
															<BarChart3 className="mr-2 h-4 w-4" />
															Analytics
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem
														className="text-destructive"
														onClick={() => handleDelete(tool.id, tool.name)}
														disabled={deleteToolMutation.isPending}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{totalPages > 1 && (
					<div className="mt-8">
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
					</div>
				)}
			</div>
		</Container>
	);
}
