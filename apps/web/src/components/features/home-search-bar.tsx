"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/features/search-bar";

interface HomeSearchBarProps {
	placeholder?: string;
	suggestions?: string[];
}

export function HomeSearchBar({
	placeholder,
	suggestions,
}: HomeSearchBarProps) {
	const router = useRouter();

	const handleSearch = (query: string) => {
		if (query.trim()) {
			router.push(`/search?q=${encodeURIComponent(query)}`);
		}
	};

	return (
		<SearchBar
			placeholder={placeholder}
			onSearch={handleSearch}
			suggestions={suggestions}
		/>
	);
}
