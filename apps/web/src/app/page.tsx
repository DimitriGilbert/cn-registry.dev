"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, Sparkles, TrendingUp, Eye, GitBranch, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { CollectionSection } from "@/components/features/collection-section";
import { SearchBar } from "@/components/features/search-bar";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/magicui/marquee";
import { ShineBorder } from "@/components/magicui/shine-border";
import { trpc } from "@/utils/trpc";
import { getUserAvatarUrl } from "@/utils/user";

export default function HomePage() {
  const router = useRouter();

  // Fetch latest components
  const { data: latestComponents, isLoading: isLatestLoading } = useQuery(
    trpc.components.getAll.queryOptions({
      page: 1,
      limit: 10,
    })
  );

  // Fetch trending/popular components (sorted by stars)
  const { data: trendingComponents, isLoading: isTrendingLoading } = useQuery(
    trpc.components.getAll.queryOptions({
      page: 1,
      limit: 10,
      sort: 'name',
      order: 'asc'
    })
  );

  // Fetch featured tools
  const { data: featuredTools, isLoading: isToolsLoading } = useQuery(
    trpc.tools.getAll.queryOptions({
      page: 1,
      limit: 10,
    })
  );

  // Fetch trending creators for marquee
  const { data: trendingCreators } = useQuery(
    trpc.creators.getTrending.queryOptions({
      limit: 12,
    })
  );

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Container>
      <div className="py-12">
        {/* Alpha Warning */}
        <div className="mb-8 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Alpha Version</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                This is an alpha version. You might encounter bugs and missing
                features. Please help us improve by reporting issues!
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://github.com/DimitriGilbert/cn-registry.dev/issues",
                  "_blank"
                )
              }
            >
              Report Issue
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-20">
          <div className="relative rounded-2xl border bg-muted/50 p-8 md:p-12 overflow-hidden">
            <ShineBorder shineColor={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]} />
            {/* Mobile/Tablet - centered layout */}
            <div className="lg:hidden space-y-8 text-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  cn-registry
                </h1>
                <p className="text-xl text-muted-foreground md:text-2xl">
                  A registry for ShadCN/UI components and tools
                </p>
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    Hunting down quality components shouldn't feel like unpaid labor.
                  </p>
                  <p className="text-base text-muted-foreground">
                    cn-registry collects the best community-made ShadCN components and tools — searchable, categorized, previewable.
                  </p>
                  <p className="text-base text-muted-foreground">
                    No more digging through 12 GitHub tabs and half-broken blogs.
                  </p>
                </div>
              </div>
              <div className="mx-auto max-w-md">
                <SearchBar
                  placeholder="Search components and tools..."
                  onSearch={handleSearch}
                  suggestions={["data table", "form", "chart", "calendar", "cli"]}
                />
              </div>
            </div>
            
            {/* Desktop - left content, right marquee */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-5xl font-bold tracking-tight xl:text-6xl">
                    cn-registry
                  </h1>
                  <p className="text-2xl text-muted-foreground">
                    A registry for ShadCN/UI components and tools
                  </p>
                  <div className="space-y-4">
                    <p className="text-lg text-muted-foreground">
                      Hunting down quality components shouldn't feel like unpaid labor.
                    </p>
                    <p className="text-base text-muted-foreground">
                      cn-registry collects the best community-made ShadCN components and tools. Searchable, categorized, previewable.
                    </p>
                    <p className="text-base text-muted-foreground">
                      No more digging through 12 GitHub tabs and half-broken blogs.
                    </p>
                  </div>
                </div>
                <div className="max-w-md">
                  <SearchBar
                    placeholder="Search components and tools..."
                    onSearch={handleSearch}
                    suggestions={["data table", "form", "chart", "calendar", "cli"]}
                  />
                </div>
              </div>
              
              <div className="flex h-[400px] w-full flex-row items-center justify-center">
                <Marquee pauseOnHover vertical className="[--duration:20s] [--gap:0.5rem]">
                  {(trendingCreators || Array(6).fill(null)).slice(0, 6).map((creator, i) => (
                    <a 
                      key={creator?.id || i} 
                      href={creator?.username ? `/creators/${creator.username}` : '#'}
                      className="h-24 w-64 cursor-pointer overflow-hidden rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img 
                          src={getUserAvatarUrl(creator || {})} 
                          alt={creator?.name || 'Creator'} 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{creator?.name || 'Loading...'}</div>
                          <div className="text-xs text-muted-foreground truncate">{creator?.componentCount || 0} components</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {creator?.totalStars || 0} ★ • {(creator?.bio || 'Component creator').replace(/GitHub:\s*https?:\/\/[^\s•]+/g, '').replace(/•\s*$/, '').trim()}
                      </div>
                    </a>
                  ))}
                </Marquee>
                <Marquee reverse pauseOnHover vertical className="[--duration:20s] [--gap:0.5rem]">
                  {(trendingCreators || Array(6).fill(null)).slice(6, 12).map((creator, i) => (
                    <a 
                      key={creator?.id || i + 6} 
                      href={creator?.username ? `/creators/${creator.username}` : '#'}
                      className="h-24 w-64 cursor-pointer overflow-hidden rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img 
                          src={getUserAvatarUrl(creator || {})} 
                          alt={creator?.name || 'Creator'} 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{creator?.name || 'Loading...'}</div>
                          <div className="text-xs text-muted-foreground truncate">{creator?.componentCount || 0} components</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {creator?.totalStars || 0} ★ • {(creator?.bio || 'Component creator').replace(/GitHub:\s*https?:\/\/[^\s•]+/g, '').replace(/•\s*$/, '').trim()}
                      </div>
                    </a>
                  ))}
                </Marquee>
              </div>
            </div>
          </div>
        </div>

        <CollectionSection
          title="Latest Components"
          icon={Clock}
          items={latestComponents?.components}
          isLoading={isLatestLoading}
          viewAllLink="/components"
          itemType="component"
          layout="carousel"
          skeletonCount={10}
          animationType="scale"
        />

        {/* Why this exists section */}
        <div className="my-24">
          <div className="relative rounded-2xl border bg-muted/50 p-8 md:p-12 overflow-hidden">
            <ShineBorder shineColor={["var(--chart-4)", "var(--chart-5)", "var(--chart-1)"]} />
            
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl font-bold md:text-4xl">Why this exists</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Because finding good ShadCN/UI components sucks.
              </p>
            </div>
            
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-lg bg-destructive/10 p-2">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold">The Problem</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  You want a gradient card or a dashboard chart but instead you're crawling Reddit, Discord, npm, and some guy's Notion doc from 2022.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <Sparkles className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">The Solution</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  This registry brings it all to one place:
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg p-3" style={{backgroundColor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)'}}>
                      <Eye className="h-5 w-5" style={{color: 'var(--chart-1)'}} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">Live previews</h4>
                      <p className="text-muted-foreground text-sm">(coming soon™)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg p-3" style={{backgroundColor: 'color-mix(in srgb, var(--chart-2) 10%, transparent)'}}>
                      <GitBranch className="h-5 w-5" style={{color: 'var(--chart-2)'}} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">Complete metadata</h4>
                      <p className="text-muted-foreground text-sm">GitHub metadata, install commands, and README in one view</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg p-3" style={{backgroundColor: 'color-mix(in srgb, var(--chart-3) 10%, transparent)'}}>
                      <Filter className="h-5 w-5" style={{color: 'var(--chart-3)'}} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">Actually works</h4>
                      <p className="text-muted-foreground text-sm">Tags, categories, and filters that actually work</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center space-y-6">
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Components and tools live in separate spaces. Users can star, comment, and browse what others are using.
              </p>
              
              <div className="bg-muted/30 rounded-xl p-6 max-w-2xl mx-auto">
                <p className="text-xl font-semibold text-foreground">
                  This isn't a UI kit. It's the map of where the good stuff is.
                </p>
              </div>
            </div>
          </div>
        </div>

        <CollectionSection
          title="Popular Components"
          icon={TrendingUp}
          items={trendingComponents?.components}
          isLoading={isTrendingLoading}
          viewAllLink="/components?sort=stars"
          itemType="component"
          layout="carousel"
          emptyMessage="No popular components available yet."
          skeletonCount={10}
          animationType="opacity"
        />

        <CollectionSection
          title="Featured Tools"
          icon={Sparkles}
          items={featuredTools?.tools}
          isLoading={isToolsLoading}
          viewAllLink="/tools"
          itemType="tool"
          layout="carousel"
          skeletonCount={10}
          animationType="default"
        />
      </div>
    </Container>
  );
}
