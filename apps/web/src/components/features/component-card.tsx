"use client";

import {
	Download,
	ExternalLink,
	Github,
	ShoppingCart,
	Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { trpcClient } from "@/utils/trpc";
import { getUserAvatarUrl } from "@/utils/user";
import { StarButton } from "./star-button";

// Helper function to format numbers with K abbreviation
function formatStars(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1).replace(".0", "")}K`;
	}
	return count.toString();
}

type ComponentCardProps = Awaited<
	ReturnType<typeof trpcClient.components.getAll.query>
>["components"][number] & {
	isStarred?: boolean;
	onToggleStar?: () => void;
	disableHoverEffects?: boolean; // For carousel usage
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
	disableHoverEffects = false,
}: ComponentCardProps) {
	const { addToCart, removeFromCart, isInCart } = useCart();
	const finalGithubUrl = githubUrl || repoUrl;

	// Use database stored GitHub data (already cached from backend)
	const githubData = { stars: starsCount || 0 };

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
		<Card
			className={cn(
				"group relative overflow-hidden border shadow-sm",
				!disableHoverEffects &&
					"hover:-translate-y-1 transition-all duration-150 hover:scale-[1.02] hover:shadow-lg",
			)}
		>
			{/* Very subtle gradient overlay */}
			<div
				className={cn(
					"absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-muted/3 opacity-0",
					!disableHoverEffects &&
						"transition-opacity duration-75 group-hover:opacity-100",
				)}
			/>

			{/* Content */}
			<div className="relative">
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<div className="flex-1 space-y-2">
							<div className="flex items-center gap-2">
								<CardTitle className="font-semibold text-lg leading-tight transition-colors group-hover:text-primary">
									<Link href={`/components/${id}`} className="hover:underline">
										{name}
									</Link>
								</CardTitle>
								{starsCount > 0 && (
									<div className="flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-1 text-muted-foreground text-xs">
										<Star className="h-3 w-3 fill-current" />
										{formatStars(starsCount)}
									</div>
								)}
							</div>
							<CardDescription className="line-clamp-2 text-sm leading-relaxed">
								{description}
							</CardDescription>
						</div>
						<StarButton isStarred={isStarred} onToggle={onToggleStar} />
					</div>

					{/* Categories and Creator Row */}
					<div className="flex items-center justify-between pt-2">
						<div className="flex flex-wrap items-center gap-1.5">
							{categories
								?.filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
								.slice(0, 2)
								.map((category) => (
									<Badge
										key={category.id}
										variant="secondary"
										className="border-primary/20 bg-primary/10 px-2 py-0.5 text-primary text-xs transition-colors hover:bg-primary/20"
									>
										{category.name}
									</Badge>
								))}
							{categories && categories.length > 2 && (
								<Badge variant="outline" className="px-2 py-0.5 text-xs">
									+{categories.length - 2}
								</Badge>
							)}
						</div>
						{creator && creator.username && (
							<Link
								href={`/creators/${creator.username}`}
								className="group/creator flex items-center gap-2 text-muted-foreground text-xs transition-colors hover:text-foreground"
								title={`View ${creator.name || creator.username}'s profile`}
							>
								<Avatar className="h-5 w-5 ring-2 ring-transparent transition-all group-hover/creator:ring-primary/30">
									<AvatarImage
										src={getUserAvatarUrl(creator)}
										alt={creator.name || creator.username}
									/>
									<AvatarFallback className="bg-primary/10 text-[10px]">
										{(creator.name || creator.username)
											.split(" ")
											.map((n) => n[0])
											.join("")
											.slice(0, 2)
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="hidden font-medium sm:inline">
									{creator.name || creator.username}
								</span>
							</Link>
						)}
					</div>
				</CardHeader>

				<CardContent className="pt-0">
					{/* Action Buttons */}
					<div className="flex items-center gap-2">
						<Button
							asChild
							size="sm"
							className={cn(
								"flex-1 shadow-sm hover:shadow-md",
								!disableHoverEffects && "transition-all duration-75",
							)}
						>
							<Link href={`/components/${id}`}>View Details</Link>
						</Button>
						<Button
							variant={isInCart(id) ? "default" : "outline"}
							size="sm"
							onClick={handleCartToggle}
							className={cn(
								"hover:scale-[1.02]",
								!disableHoverEffects && "transition-transform duration-75",
							)}
						>
							<ShoppingCart className="h-3 w-3" />
						</Button>
						{finalGithubUrl && (
							<Button
								variant="outline"
								size="sm"
								asChild
								className="relative transition-transform duration-200 hover:scale-[1.02]"
							>
								<Link
									href={finalGithubUrl}
									target="_blank"
									className="relative"
								>
									<Github className="h-3 w-3" />
									{githubData?.stars !== undefined && (
										<Badge
											variant="secondary"
											className="-top-1 -right-1 absolute h-3 min-w-0 bg-foreground px-1 font-medium text-[10px] text-background leading-none"
										>
											{formatStars(githubData.stars)}
										</Badge>
									)}
								</Link>
							</Button>
						)}
						{websiteUrl && (
							<Button
								variant="outline"
								size="sm"
								asChild
								className={cn(
									"hover:scale-[1.02]",
									!disableHoverEffects && "transition-transform duration-75",
								)}
							>
								<Link href={websiteUrl} target="_blank">
									<ExternalLink className="h-3 w-3" />
								</Link>
							</Button>
						)}
					</div>
				</CardContent>
			</div>
		</Card>
	);
}
