"use client";

import { Download, ExternalLink, Github, Star } from "lucide-react";
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
import { StarButton } from "./star-button";

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
	isStarred = false,
	onToggleStar,
}: ComponentCardProps) {
	const finalGithubUrl = githubUrl || repoUrl;
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
