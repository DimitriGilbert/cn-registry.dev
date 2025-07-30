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
import { cn } from "@/lib/utils";

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
          "transition-all duration-150 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1"
      )}
    >
      {/* Very subtle gradient overlay with tool-specific accent */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-accent/2 via-transparent to-secondary/2 opacity-0",
          !disableHoverEffects &&
            "transition-opacity duration-75 group-hover:opacity-100"
        )}
      />

      {/* Content */}
      <div className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle
                  className={cn(
                    "text-lg font-semibold leading-tight",
                    !disableHoverEffects &&
                      "transition-colors group-hover:text-accent"
                  )}
                >
                  <Link href={`/tools/${id}`} className="hover:underline">
                    {name}
                  </Link>
                </CardTitle>
                {/* Tool type indicator */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full bg-gradient-to-r from-accent to-secondary animate-pulse opacity-60",
                    !disableHoverEffects &&
                      "group-hover:opacity-100 transition-opacity"
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {starsCount > 0 && (
                <div className="flex items-center gap-1 bg-warning/10 text-warning dark:text-warning px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  {starsCount}
                </div>
              )}
              {downloads && downloads > 0 && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary dark:text-primary px-2 py-1 rounded-full">
                  <Download className="h-3 w-3" />
                  {formatDownloads(downloads)}
                </div>
              )}
            </div>
          </div>

          {/* Categories and Creator Row */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories
                ?.filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
                .slice(0, 2)
                .map((category) => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-warning/10 text-warning dark:text-warning border-warning/20 hover:bg-warning/20 transition-colors"
                  >
                    {category.name}
                  </Badge>
                ))}
              {categories && categories.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{categories.length - 2}
                </Badge>
              )}
            </div>
            {creator && creator.username && (
              <Link
                href={`/creators/${creator.username}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group/creator"
                title={`View ${creator.name || creator.username}'s profile`}
              >
                <Avatar className="h-5 w-5 ring-2 ring-transparent group-hover/creator:ring-warning/30 transition-all">
                  <AvatarImage
                    src={getUserAvatarUrl(creator)}
                    alt={creator.name || creator.username}
                  />
                  <AvatarFallback className="text-[10px] bg-orange-500/10">
                    {(creator.name || creator.username)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline font-medium">
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
                "flex-1 bg-gradient-to-r from-accent/90 to-secondary/90 hover:from-accent hover:to-secondary shadow-sm hover:shadow-md",
                !disableHoverEffects && "transition-all duration-75"
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
                    "transition-transform duration-75 hover:border-accent"
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
                    "transition-transform duration-75 hover:border-secondary"
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
