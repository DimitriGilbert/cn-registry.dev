"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StarButtonProps {
	isStarred?: boolean;
	count?: number;
	onToggle?: () => void;
	isLoading?: boolean;
	size?: "sm" | "default" | "lg";
}

export function StarButton({
	isStarred = false,
	count = 0,
	onToggle,
	isLoading = false,
	size = "sm",
}: StarButtonProps) {
	return (
		<Button
			variant="ghost"
			size={size}
			onClick={onToggle}
			disabled={isLoading}
			className={cn(
				"flex items-center gap-1 p-1",
				isStarred && "text-yellow-500",
			)}
		>
			<Star className={cn("h-4 w-4", isStarred && "fill-current")} />
			{count > 0 && <span className="text-sm">{count}</span>}
		</Button>
	);
}
