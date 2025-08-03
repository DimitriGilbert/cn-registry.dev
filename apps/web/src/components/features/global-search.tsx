"use client";

import { useQuery } from "@tanstack/react-query";
import { Component, FolderOpen, Search, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/utils/trpc";

interface SearchResultItem {
	type: "component" | "tool" | "project";
	id: string;
	slug?: string;
	name: string;
	description?: string | null;
	visibility?: string;
}

interface GlobalSearchProps {
	className?: string;
	placeholder?: string;
}

export function GlobalSearch({
	className = "w-[300px]",
	placeholder = "Search components, tools, projects...",
}: GlobalSearchProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const router = useRouter();

	// Get search suggestions
	const { data: suggestions = [], error: suggestionsError } = useQuery({
		...trpc.search.suggestions.queryOptions({
			query,
			limit: 5,
		}),
		enabled: query.length > 0,
	});

	// Get search results
	const { data: searchResults } = useQuery({
		...trpc.search.global.queryOptions({
			query,
			limit: 15,
		}),
		enabled: query.length > 2,
	});

	const handleSearch = (searchQuery: string) => {
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			setOpen(false);
			setQuery("");
		}
	};

	const handleItemSelect = (item: SearchResultItem) => {
		let path = "";
		switch (item.type) {
			case "component":
				path = `/components/${item.id}`;
				break;
			case "tool":
				path = `/tools/${item.id}`;
				break;
			case "project":
				path = `/projects/${item.slug}`;
				break;
		}
		if (path) {
			router.push(path);
			setOpen(false);
			setQuery("");
		}
	};

	const getItemIcon = (type: string) => {
		switch (type) {
			case "component":
				return <Component className="h-4 w-4" />;
			case "tool":
				return <Wrench className="h-4 w-4" />;
			case "project":
				return <FolderOpen className="h-4 w-4" />;
			default:
				return <Search className="h-4 w-4" />;
		}
	};

	return (
		<div className={`relative ${className}`}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div className="relative">
						<Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={placeholder}
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setOpen(e.target.value.length > 0);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSearch(query);
								}
							}}
							className="pl-8"
						/>
					</div>
				</PopoverTrigger>
				<PopoverContent
					className="w-[--radix-popover-trigger-width] p-0"
					align="start"
				>
					<Command>
						<CommandList>
							{query.length > 2 && searchResults?.results.length === 0 && (
								<CommandEmpty>No results found.</CommandEmpty>
							)}

							{/* Search Suggestions */}
							{query.length > 0 &&
								query.length <= 2 &&
								suggestions.length > 0 && (
									<CommandGroup heading="Suggestions">
										{suggestions.map((suggestion) => (
											<CommandItem
												key={suggestion}
												onSelect={() => handleSearch(suggestion)}
											>
												<Search className="mr-2 h-4 w-4" />
												{suggestion}
											</CommandItem>
										))}
									</CommandGroup>
								)}

							{/* Search Results */}
							{searchResults && searchResults.results.length > 0 && (
								<>
									{/* Components */}
									{searchResults.results
										.filter((r) => r.type === "component")
										.slice(0, 5).length > 0 && (
										<CommandGroup heading="Components">
											{searchResults.results
												.filter((r) => r.type === "component")
												.slice(0, 5)
												.map((item) => (
													<CommandItem
														key={`${item.type}-${item.id}`}
														onSelect={() =>
															handleItemSelect(item as SearchResultItem)
														}
													>
														{getItemIcon(item.type)}
														<div className="ml-2 flex-1">
															<div className="font-medium">{item.name}</div>
															<div className="text-muted-foreground text-sm">
																{item.description}
															</div>
														</div>
													</CommandItem>
												))}
										</CommandGroup>
									)}

									{/* Tools */}
									{searchResults.results
										.filter((r) => r.type === "tool")
										.slice(0, 5).length > 0 && (
										<CommandGroup heading="Tools">
											{searchResults.results
												.filter((r) => r.type === "tool")
												.slice(0, 5)
												.map((item) => (
													<CommandItem
														key={`${item.type}-${item.id}`}
														onSelect={() =>
															handleItemSelect(item as SearchResultItem)
														}
													>
														{getItemIcon(item.type)}
														<div className="ml-2 flex-1">
															<div className="font-medium">{item.name}</div>
															<div className="text-muted-foreground text-sm">
																{item.description}
															</div>
														</div>
													</CommandItem>
												))}
										</CommandGroup>
									)}

									{/* Projects */}
									{searchResults.results
										.filter((r) => r.type === "project")
										.slice(0, 5).length > 0 && (
										<CommandGroup heading="Projects">
											{searchResults.results
												.filter((r) => r.type === "project")
												.slice(0, 5)
												.map((item) => (
													<CommandItem
														key={`${item.type}-${(item as any).slug}`}
														onSelect={() =>
															handleItemSelect(item as SearchResultItem)
														}
													>
														{getItemIcon(item.type)}
														<div className="ml-2 flex-1">
															<div className="flex items-center gap-2">
																<span className="font-medium">{item.name}</span>
																<Badge variant="secondary" className="text-xs">
																	{"visibility" in item
																		? item.visibility
																		: "public"}
																</Badge>
															</div>
															<div className="text-muted-foreground text-sm">
																{item.description}
															</div>
														</div>
													</CommandItem>
												))}
										</CommandGroup>
									)}

									{/* View all results */}
									{searchResults.total > 10 && (
										<CommandGroup>
											<CommandItem onSelect={() => handleSearch(query)}>
												<Search className="mr-2 h-4 w-4" />
												View all {searchResults.total} results
											</CommandItem>
										</CommandGroup>
									)}
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
