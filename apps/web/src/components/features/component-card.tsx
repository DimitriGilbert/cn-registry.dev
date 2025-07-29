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
import type { trpcClient } from "@/utils/trpc";
import { getUserAvatarUrl } from "@/utils/user";
import { StarButton } from "./star-button";
import { cn } from "@/lib/utils";

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
          "transition-all duration-150 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1"
      )}
    >
      {/* Very subtle gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-muted/3 opacity-0",
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
                <CardTitle className="text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                  <Link href={`/components/${id}`} className="hover:underline">
                    {name}
                  </Link>
                </CardTitle>
                {starsCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
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
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories
                ?.filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
                .slice(0, 2)
                .map((category) => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
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
                <Avatar className="h-5 w-5 ring-2 ring-transparent group-hover/creator:ring-primary/30 transition-all">
                  <AvatarImage
                    src={getUserAvatarUrl(creator)}
                    alt={creator.name || creator.username}
                  />
                  <AvatarFallback className="text-[10px] bg-primary/10">
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
                "flex-1 shadow-sm hover:shadow-md",
                !disableHoverEffects && "transition-all duration-75"
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
                !disableHoverEffects && "transition-transform duration-75"
              )}
            >
              <ShoppingCart className="h-3 w-3" />
            </Button>
            {finalGithubUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="relative hover:scale-[1.02] transition-transform duration-200"
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
                      className="absolute -top-1 -right-1 h-3 px-1 text-[10px] leading-none bg-foreground text-background font-medium min-w-0"
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
                  !disableHoverEffects && "transition-transform duration-75"
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
