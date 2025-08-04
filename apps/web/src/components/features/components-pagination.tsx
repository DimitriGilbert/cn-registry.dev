"use client";

import { useRouter } from "next/navigation";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface ComponentsPaginationProps {
	currentPage: number;
	totalPages: number;
	currentQuery?: string;
	currentCategory?: string;
	currentSort: string;
}

export function ComponentsPagination({
	currentPage,
	totalPages,
	currentQuery,
	currentCategory,
	currentSort,
}: ComponentsPaginationProps) {
	const router = useRouter();

	const updateURL = (page: number) => {
		const url = new URL(window.location.href);
		if (currentQuery) url.searchParams.set("q", currentQuery);
		else url.searchParams.delete("q");
		if (currentCategory) url.searchParams.set("categoryId", currentCategory);
		else url.searchParams.delete("categoryId");
		if (page > 1) url.searchParams.set("page", page.toString());
		else url.searchParams.delete("page");
		if (currentSort !== "latest") url.searchParams.set("sort", currentSort);
		else url.searchParams.delete("sort");
		router.push(url.pathname + url.search);
	};

	return (
		<div className="flex justify-center">
			<Pagination>
				<PaginationContent className="rounded-lg border bg-card/50 p-2 backdrop-blur-sm">
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (currentPage > 1) {
									updateURL(currentPage - 1);
								}
							}}
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
									onClick={(e) => {
										e.preventDefault();
										updateURL(page);
									}}
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
							onClick={(e) => {
								e.preventDefault();
								if (currentPage < totalPages) {
									updateURL(currentPage + 1);
								}
							}}
							className="hover:bg-primary/10"
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
