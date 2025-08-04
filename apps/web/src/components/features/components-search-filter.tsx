"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { FilterPanel } from "@/components/features/filter-panel";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useFormedible } from "@/hooks/use-formedible";

const searchSchema = z.object({
	query: z.string(),
});

interface ComponentsSearchAndFilterProps {
	categories: any[];
	currentQuery?: string;
	currentCategory?: string;
	currentSort: string;
}

export function ComponentsSearchAndFilter({
	categories,
	currentQuery = "",
	currentCategory = "",
	currentSort,
}: ComponentsSearchAndFilterProps) {
	const router = useRouter();

	const { Form: SearchForm } = useFormedible({
		schema: searchSchema,
		fields: [
			{
				name: "query",
				type: "text",
				placeholder: "Search components...",
			},
		],
		formOptions: {
			defaultValues: { query: currentQuery },
			onSubmit: async ({ value }) => {
				updateURL({
					query: value.query,
					categoryId: currentCategory,
					page: 1,
					sort: currentSort,
				});
			},
		},
		showSubmitButton: false,
	});

	const updateURL = (params: {
		query?: string;
		categoryId?: string;
		page?: number;
		sort?: string;
	}) => {
		const url = new URL(window.location.href);
		if (params.query) url.searchParams.set("q", params.query);
		else url.searchParams.delete("q");
		if (params.categoryId)
			url.searchParams.set("categoryId", params.categoryId);
		else url.searchParams.delete("categoryId");
		if (params.page && params.page > 1)
			url.searchParams.set("page", params.page.toString());
		else url.searchParams.delete("page");
		if (params.sort && params.sort !== "latest")
			url.searchParams.set("sort", params.sort);
		else url.searchParams.delete("sort");
		router.push(url.pathname + url.search);
	};

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
		<div className="mb-12 space-y-6">
			<div className="relative">
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
				<div className="relative rounded-2xl border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end">
						<div className="flex-1">
							<SearchForm />
						</div>
						<div className="flex items-center gap-4">
							<FilterPanel
								filterGroups={filterGroups}
								selectedFilters={currentCategory ? [currentCategory] : []}
								onFiltersChange={(filters) => {
									const newCategory = filters[0] || "";
									updateURL({
										query: currentQuery,
										categoryId: newCategory,
										page: 1,
										sort: currentSort,
									});
								}}
							/>
							<Select
								value={currentSort}
								onValueChange={(value) => {
									updateURL({
										query: currentQuery,
										categoryId: currentCategory,
										page: 1,
										sort: value,
									});
								}}
							>
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
		</div>
	);
}
