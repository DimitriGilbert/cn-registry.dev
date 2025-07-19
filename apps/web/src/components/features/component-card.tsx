"use client";

import { Download, ExternalLink, Github, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/components/providers/cart-provider";
import { StarButton } from "./star-button";
import { toast } from "sonner";

interface ComponentCardProps {
	id: string;
	name: string;
	description: string;
	categories?: ({ id: string; name: string } | null)[];
	starsCount?: number;
	downloads?: number;
	githubUrl?: string | null;
	repoUrl?: string | null;
	websiteUrl?: string | null;
	installUrl?: string | null;
	installCommand?: string | null;
	tags?: string[] | null;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	creator?: {
		id: string;
		name: string;
		username?: string | null;
		image?: string | null;
	} | null;
	isStarred?: boolean;
	onToggleStar?: () => void;
}

export function ComponentCard({
	id,
	name,
	description,
	categories,
	starsCount = 0,
	downloads = 0,
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
						<div className="flex items-center gap-1">
							<Download className="h-3 w-3" />
							{downloads}
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
						<Button variant="outline" size="sm" asChild>
							<Link href={finalGithubUrl} target="_blank">
								<Github className="h-3 w-3" />
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
