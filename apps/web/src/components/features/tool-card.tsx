import { Download, ExternalLink, Github, Star } from "lucide-react";
import Link from "next/link";
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
import { getUserAvatarUrl } from "@/utils/user";
import { StarButton } from "./star-button";

interface ToolCardProps {
	id: string;
	name: string;
	description: string;
	categories?: ({ id: string; name: string } | null)[];
	starsCount?: number;
	downloads?: number;
	githubUrl?: string | null;
	repoUrl?: string | null;
	websiteUrl?: string | null;
	installCommand?: string | null;
	creator?: {
		id: string;
		name: string;
		username: string | null;
		image: string | null;
	} | null;
	isStarred?: boolean;
	onToggleStar?: () => void;
	disableHoverEffects?: boolean; // For carousel usage
}

export function ToolCard({
	id,
	name,
	description,
	categories,
	starsCount = 0,
	downloads,
	githubUrl,
	repoUrl,
	websiteUrl,
	creator,
	isStarred = false,
	onToggleStar,
	disableHoverEffects = false,
}: ToolCardProps) {
	const finalGithubUrl = githubUrl || repoUrl;

	// Format downloads for display
	const formatDownloads = (count: number): string => {
		if (count >= 1000000) {
			return `${(count / 1000000).toFixed(1).replace(".0", "")}M`;
		}
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1).replace(".0", "")}K`;
		}
		return count.toString();
	};

	return (
		<Card
			className={cn(
				"group relative overflow-hidden border shadow-sm",
				!disableHoverEffects &&
					"hover:-translate-y-1 transition-all duration-150 hover:scale-[1.02] hover:shadow-lg",
			)}
		>
			{/* Very subtle gradient overlay with tool-specific accent */}
			<div
				className={cn(
					"absolute inset-0 bg-gradient-to-br from-accent/2 via-transparent to-secondary/2 opacity-0",
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
								<CardTitle
									className={cn(
										"font-semibold text-lg leading-tight",
										!disableHoverEffects &&
											"transition-colors group-hover:text-accent",
									)}
								>
									<Link href={`/tools/${id}`} className="hover:underline">
										{name}
									</Link>
								</CardTitle>
								{/* Tool type indicator */}
								<div
									className={cn(
										"h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-accent to-secondary opacity-60",
										!disableHoverEffects &&
											"transition-opacity group-hover:opacity-100",
									)}
								/>
							</div>
							<CardDescription className="line-clamp-2 text-sm leading-relaxed">
								{description}
							</CardDescription>
						</div>
						<StarButton isStarred={isStarred} onToggle={onToggleStar} />
					</div>

					{/* Stats Row */}
					<div className="flex items-center gap-4 pt-2">
						<div className="flex items-center gap-3 text-muted-foreground text-xs">
							{starsCount > 0 && (
								<div className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-warning dark:text-warning">
									<Star className="h-3 w-3 fill-current" />
									{starsCount}
								</div>
							)}
							{downloads && downloads > 0 && (
								<div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary dark:text-primary">
									<Download className="h-3 w-3" />
									{formatDownloads(downloads)}
								</div>
							)}
						</div>
					</div>

					{/* Categories and Creator Row */}
					<div className="flex items-center justify-between pt-3">
						<div className="flex flex-wrap items-center gap-1.5">
							{categories
								?.filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
								.slice(0, 2)
								.map((category) => (
									<Badge
										key={category.id}
										variant="secondary"
										className="border-warning/20 bg-warning/10 px-2 py-0.5 text-warning text-xs transition-colors hover:bg-warning/20 dark:text-warning"
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
								<Avatar className="h-5 w-5 ring-2 ring-transparent transition-all group-hover/creator:ring-warning/30">
									<AvatarImage
										src={getUserAvatarUrl(creator)}
										alt={creator.name || creator.username}
									/>
									<AvatarFallback className="bg-orange-500/10 text-[10px]">
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
								"flex-1 bg-gradient-to-r from-accent/90 to-secondary/90 shadow-sm hover:from-accent hover:to-secondary hover:shadow-md",
								!disableHoverEffects && "transition-all duration-75",
							)}
						>
							<Link href={`/tools/${id}`}>View Details</Link>
						</Button>
						{finalGithubUrl && (
							<Button
								variant="outline"
								size="sm"
								asChild
								className={cn(
									"hover:scale-[1.02]",
									!disableHoverEffects &&
										"transition-transform duration-75 hover:border-accent",
								)}
							>
								<Link href={finalGithubUrl} target="_blank">
									<Github className="h-3 w-3" />
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
									!disableHoverEffects &&
										"transition-transform duration-75 hover:border-secondary",
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
