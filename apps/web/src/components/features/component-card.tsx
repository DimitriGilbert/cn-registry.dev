"use client";

import {
	Download,
	ExternalLink,
	Github,
	ShoppingCart,
	Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { trpcClient } from "@/utils/trpc";
import { trpc } from "@/utils/trpc";
import { StarButton } from "./star-button";

// Helper function to format numbers with K abbreviation
function formatStars(count: number): string {
	if (count < 0) return '0';
	if (count >= 1000) {
		const formatted = (count / 1000).toFixed(1);
		return formatted.endsWith('.0') ? `${Math.floor(count / 1000)}K` : `${formatted}K`;
	}
	return count.toString();
}

type ComponentCardProps = Awaited<
	ReturnType<typeof trpcClient.components.getAll.query>
>["components"][number] & {
	isStarred?: boolean;
	onToggleStar?: () => void;
};

export function ComponentCard({
	id,
	name,
	description,
	categories,
	starsCount = 0,
	githubUrl,
	repoUrl,
	websiteUrl,
	installUrl,
	installCommand,
	tags,
	status = "published",
	createdAt,
	updatedAt,
	creator,
	isStarred = false,
	onToggleStar,
}: ComponentCardProps) {
	const { addToCart, removeFromCart, isInCart } = useCart();
	const finalGithubUrl = githubUrl || repoUrl;

	// Fetch GitHub data for star count
	const { data: githubData } = useQuery(
		{
			...trpc.github.getRepoStats.queryOptions({
				repoUrl: finalGithubUrl || ""
			}),
			enabled: !!(finalGithubUrl && finalGithubUrl.includes("github.com") && finalGithubUrl.trim() !== ""),
			staleTime: 10 * 60 * 1000, // 10 minutes cache
			retry: 2,
			retryDelay: 1000,
		}
	);

	const handleCartToggle = () => {
		const component = {
			id,
			name,
			description,
			repoUrl: repoUrl || null,
			websiteUrl: websiteUrl || null,
			installUrl: installUrl || null,
			installCommand: installCommand || null,
			tags: tags || null,
			status: status || "published",
			createdAt: createdAt || new Date().toISOString(),
			updatedAt: updatedAt || new Date().toISOString(),
			creator: creator || null,
			categories,
			starsCount: starsCount || 0,
			githubUrl: finalGithubUrl || null,
			isStarred: isStarred || false,
			forksCount: 0,
			issuesCount: 0,
			watchersCount: 0,
			readme: null,
			exampleCode: null,
			previewUrl: null,
		};

		if (isInCart(id)) {
			removeFromCart(id);
			toast.success(`Removed ${name} from cart`);
		} else {
			addToCart(component);
			toast.success(`Added ${name} to cart`);
		}
	};
	return (
		<Card className="group transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-lg">
							<Link href={`/components/${id}`} className="hover:underline">
								{name}
							</Link>
						</CardTitle>
						<CardDescription className="line-clamp-2">
							{description}
						</CardDescription>
					</div>
					<StarButton isStarred={isStarred} onToggle={onToggleStar} />
				</div>
				<div className="flex items-center gap-2">
					{categories
						?.filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
						.map((category) => (
							<Badge key={category.id} variant="secondary">
								{category.name}
							</Badge>
						))}
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex items-center justify-between text-muted-foreground text-sm">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1">
							<Star className="h-3 w-3" />
							{starsCount}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild size="sm" className="flex-1">
						<Link href={`/components/${id}`}>View Details</Link>
					</Button>
					<Button
						variant={isInCart(id) ? "default" : "outline"}
						size="sm"
						onClick={handleCartToggle}
					>
						<ShoppingCart className="h-3 w-3" />
					</Button>
					{finalGithubUrl && (
						<Button variant="outline" size="sm" asChild className="relative overflow-visible">
							<Link 
								href={finalGithubUrl} 
								target="_blank" 
								className="relative"
								aria-label={`View on GitHub${githubData?.stars !== undefined ? ` (${formatStars(githubData.stars)} stars)` : ''}`}
							>
								<Github className="h-3 w-3" />
								{githubData?.stars !== undefined && (
									<Badge 
										variant="secondary" 
										className="absolute -top-2 -right-2 h-4 px-1.5 text-[10px] leading-tight font-medium min-w-0 pointer-events-none"
										aria-hidden="true"
									>
										{formatStars(githubData.stars)}
									</Badge>
								)}
							</Link>
						</Button>
					)}
					{websiteUrl && (
						<Button variant="outline" size="sm" asChild>
							<Link href={websiteUrl} target="_blank">
								<ExternalLink className="h-3 w-3" />
							</Link>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
