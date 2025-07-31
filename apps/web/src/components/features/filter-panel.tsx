"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

interface FilterOption {
	id: string;
	label: string;
	count?: number;
}

interface FilterGroup {
	id: string;
	label: string;
	options: FilterOption[];
}

interface FilterPanelProps {
	filterGroups: FilterGroup[];
	selectedFilters: string[];
	onFiltersChange: (filters: string[]) => void;
}

export function FilterPanel({
	filterGroups,
	selectedFilters,
	onFiltersChange,
}: FilterPanelProps) {
	const [open, setOpen] = useState(false);

	const toggleFilter = (filterId: string) => {
		const newFilters = selectedFilters.includes(filterId)
			? selectedFilters.filter((id) => id !== filterId)
			: [...selectedFilters, filterId];
		onFiltersChange(newFilters);
	};

	const clearFilters = () => {
		onFiltersChange([]);
	};

	const getSelectedFilterLabels = () => {
		return filterGroups.flatMap((group) =>
			group.options.filter((option) => selectedFilters.includes(option.id)),
		);
	};

	return (
		<div className="flex items-center gap-2">
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button variant="outline" size="sm">
						<Filter className="mr-2 h-4 w-4" />
						Filters
						{selectedFilters.length > 0 && (
							<Badge variant="secondary" className="ml-2">
								{selectedFilters.length}
							</Badge>
						)}
					</Button>
				</SheetTrigger>
				<SheetContent className="p-6">
					<SheetHeader className="pb-6">
						<SheetTitle>Filters</SheetTitle>
						<SheetDescription>
							Filter components by category and features
						</SheetDescription>
					</SheetHeader>
					<div className="space-y-6">
						{filterGroups.map((group) => (
							<div key={group.id} className="space-y-3">
								<h4 className="font-medium">{group.label}</h4>
								<div className="space-y-2">
									{group.options.map((option) => (
										<div
											key={option.id}
											className="flex items-center space-x-2"
										>
											<Checkbox
												id={option.id}
												checked={selectedFilters.includes(option.id)}
												onCheckedChange={() => toggleFilter(option.id)}
											/>
											<Label
												htmlFor={option.id}
												className="flex-1 cursor-pointer font-normal text-sm"
											>
												{option.label}
												{option.count && (
													<span className="ml-1 text-muted-foreground">
														({option.count})
													</span>
												)}
											</Label>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
					{selectedFilters.length > 0 && (
						<div className="pt-6 border-t">
							<Button
								variant="outline"
								onClick={clearFilters}
								className="w-full bg-transparent"
							>
								Clear All Filters
							</Button>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{selectedFilters.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					{getSelectedFilterLabels().map((filter) => (
						<Badge
							key={filter.id}
							variant="secondary"
							className="cursor-pointer"
							onClick={() => toggleFilter(filter.id)}
						>
							{filter.label}
							<X className="ml-1 h-3 w-3" />
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
