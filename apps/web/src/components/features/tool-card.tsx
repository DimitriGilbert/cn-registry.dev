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
	installCommand,
	creator,
	isStarred = false,
	onToggleStar,
}: ToolCardProps) {
	const finalGithubUrl = githubUrl || repoUrl;
	return (
		<Card className="group transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-lg">
							<Link href={`/tools/${id}`} className="hover:underline">
								{name}
							</Link>
						</CardTitle>
						<CardDescription className="line-clamp-2">
							{description}
						</CardDescription>
					</div>
					<StarButton isStarred={isStarred} onToggle={onToggleStar} />
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{categories
							?.filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
							.map((category) => (
								<Badge key={category.id} variant="secondary">
									{category.name}
								</Badge>
							))}
					</div>
					{creator && creator.username && (
						<Link 
							href={`/creators/${creator.username}`}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							title={`View ${creator.name || creator.username}'s profile`}
						>
							<Avatar className="h-6 w-6">
								<AvatarImage src={getUserAvatarUrl(creator)} alt={creator.name || creator.username} />
								<AvatarFallback className="text-xs">
									{(creator.name || creator.username)
										.split(" ")
										.map((n) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="hidden sm:inline">{creator.name || creator.username}</span>
						</Link>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex items-center justify-between text-muted-foreground text-sm">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1">
							<Star className="h-3 w-3" />
							{starsCount}
						</div>
						{downloads && (
							<div className="flex items-center gap-1">
								<Download className="h-3 w-3" />
								{downloads}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild size="sm" className="flex-1">
						<Link href={`/tools/${id}`}>View Details</Link>
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
