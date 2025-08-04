"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/features/search-bar";

interface ClientSearchBarProps {
	className?: string;
}

export function ClientSearchBar({ className }: ClientSearchBarProps) {
	const router = useRouter();

	const handleSearch = (query: string) => {
		if (query.trim()) {
			router.push(`/search?q=${encodeURIComponent(query)}`);
		}
	};

	return (
		<div className={className}>
			<SearchBar
				placeholder="Search components and tools..."
				onSearch={handleSearch}
				suggestions={["data table", "form", "chart", "calendar", "cli"]}
			/>
		</div>
	);
}
