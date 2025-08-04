import {
	AlertTriangle,
	Clock,
	Eye,
	Filter,
	GitBranch,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { AlphaWarning } from "@/components/features/alpha-warning";
import { CollectionSection } from "@/components/features/collection-section";
import { HomeSearchBar } from "@/components/features/home-search-bar";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Marquee } from "@/components/magicui/marquee";
import { ShineBorder } from "@/components/magicui/shine-border";
import {
	getCachedComponents,
	getCachedTools,
	getCachedTrendingCreators,
} from "@/lib/cache";
import type { RouterOutputs } from "@/utils/trpc";
import { getUserAvatarUrl } from "@/utils/user";

type TrendingCreator = RouterOutputs["creators"]["getTrending"][number];

// Force dynamic rendering to avoid build-time database queries
export const dynamic = "force-dynamic";

export default async function HomePage() {
	// Fetch latest components with error handling
	let latestComponents: Awaited<ReturnType<typeof getCachedComponents>>;
	try {
		latestComponents = await getCachedComponents({
			page: 1,
			limit: 10,
		});
	} catch (error) {
		console.error("Failed to fetch latest components:", error);
		latestComponents = {
			components: [],
			totalCount: 0,
			currentPage: 1,
			totalPages: 0,
		};
	}

	// Fetch trending/popular components (sorted by stars)
	let trendingComponents: Awaited<ReturnType<typeof getCachedComponents>>;
	try {
		trendingComponents = await getCachedComponents({
			page: 1,
			limit: 10,
			sort: "stars",
			order: "desc",
		});
	} catch (error) {
		console.error("Failed to fetch trending components:", error);
		trendingComponents = {
			components: [],
			totalCount: 0,
			currentPage: 1,
			totalPages: 0,
		};
	}

	// Fetch featured tools
	let featuredTools: Awaited<ReturnType<typeof getCachedTools>>;
	try {
		featuredTools = await getCachedTools({
			page: 1,
			limit: 10,
		});
	} catch (error) {
		console.error("Failed to fetch featured tools:", error);
		featuredTools = { tools: [], totalCount: 0, currentPage: 1, totalPages: 0 };
	}

	// Fetch trending creators for marquee
	let trendingCreators: Awaited<ReturnType<typeof getCachedTrendingCreators>> =
		[];
	try {
		trendingCreators = await getCachedTrendingCreators({
			limit: 12,
		});
	} catch (error) {
		console.error("Failed to fetch trending creators:", error);
		trendingCreators = [];
	}

	return (
		<Container>
			<div className="py-12">
				{/* Alpha Warning */}
				<AlphaWarning />

				{/* Hero Section */}
				<div className="mb-20">
					<div className="relative overflow-hidden rounded-2xl border bg-muted/50 p-8 md:p-12">
						<ShineBorder
							shineColor={[
								"var(--chart-1)",
								"var(--chart-2)",
								"var(--chart-3)",
							]}
						/>
						{/* Mobile/Tablet - centered layout */}
						<div className="space-y-8 text-center lg:hidden">
							<div className="space-y-6">
								<h1 className="font-bold text-4xl tracking-tight md:text-6xl">
									cn-registry
								</h1>
								<p className="text-muted-foreground text-xl md:text-2xl">
									A registry for ShadCN/UI components and tools
								</p>
								<div className="space-y-4">
									<p className="text-lg text-muted-foreground">
										Hunting down quality components shouldn't feel like unpaid
										labor.
									</p>
									<p className="text-base text-muted-foreground">
										cn-registry collects the best community-made ShadCN
										components and tools — searchable, categorized, previewable.
									</p>
									<p className="text-base text-muted-foreground">
										No more digging through 12 GitHub tabs and half-broken
										blogs.
									</p>
								</div>
							</div>
							<div className="mx-auto max-w-md">
								<HomeSearchBar
									placeholder="Search components and tools..."
									suggestions={[
										"data table",
										"form",
										"chart",
										"calendar",
										"cli",
									]}
								/>
							</div>
						</div>

						{/* Desktop - left content, right marquee */}
						<div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
							<div className="space-y-8">
								<div className="space-y-6">
									<h1 className="font-bold text-5xl tracking-tight xl:text-6xl">
										cn-registry
									</h1>
									<p className="text-2xl text-muted-foreground">
										A registry for ShadCN/UI components and tools
									</p>
									<div className="space-y-4">
										<p className="text-lg text-muted-foreground">
											Hunting down quality components shouldn't feel like unpaid
											labor.
										</p>
										<p className="text-base text-muted-foreground">
											cn-registry collects the best community-made ShadCN
											components and tools. Searchable, categorized,
											previewable.
										</p>
										<p className="text-base text-muted-foreground">
											No more digging through 12 GitHub tabs and half-broken
											blogs.
										</p>
									</div>
								</div>
								<div className="max-w-md">
									<HomeSearchBar
										placeholder="Search components and tools..."
										suggestions={[
											"data table",
											"form",
											"chart",
											"calendar",
											"cli",
										]}
									/>
								</div>
							</div>

							<div className="flex h-[400px] w-full flex-row items-center justify-center">
								<Marquee
									pauseOnHover
									vertical
									className="[--duration:20s] [--gap:0.5rem]"
								>
									{(trendingCreators || Array(6).fill(null))
										.slice(0, 6)
										.map((creator: TrendingCreator | null, i: number) => (
											<a
												key={creator?.id || i}
												href={
													creator?.username
														? `/creators/${creator.username}`
														: "#"
												}
												className="h-24 w-64 cursor-pointer overflow-hidden rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
											>
												<div className="mb-2 flex items-center gap-3">
													<img
														src={getUserAvatarUrl(creator || {})}
														alt={creator?.name || "Creator"}
														className="h-8 w-8 rounded-full object-cover"
													/>
													<div className="min-w-0 flex-1">
														<div className="truncate font-medium text-sm">
															{creator?.name || "Loading..."}
														</div>
														<div className="truncate text-muted-foreground text-xs">
															{creator?.componentCount || 0} components
														</div>
													</div>
												</div>
												<div className="truncate text-muted-foreground text-xs">
													{creator?.totalStars || 0} ★ •{" "}
													{(creator?.bio || "Component creator")
														.replace(/GitHub:\s*https?:\/\/[^\s•]+/g, "")
														.replace(/•\s*$/, "")
														.trim()}
												</div>
											</a>
										))}
								</Marquee>
								<Marquee
									reverse
									pauseOnHover
									vertical
									className="[--duration:20s] [--gap:0.5rem]"
								>
									{(trendingCreators || Array(6).fill(null))
										.slice(6, 12)
										.map((creator: TrendingCreator | null, i: number) => (
											<a
												key={creator?.id || i + 6}
												href={
													creator?.username
														? `/creators/${creator.username}`
														: "#"
												}
												className="h-24 w-64 cursor-pointer overflow-hidden rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
											>
												<div className="mb-2 flex items-center gap-3">
													<img
														src={getUserAvatarUrl(creator || {})}
														alt={creator?.name || "Creator"}
														className="h-8 w-8 rounded-full object-cover"
													/>
													<div className="min-w-0 flex-1">
														<div className="truncate font-medium text-sm">
															{creator?.name || "Loading..."}
														</div>
														<div className="truncate text-muted-foreground text-xs">
															{creator?.componentCount || 0} components
														</div>
													</div>
												</div>
												<div className="truncate text-muted-foreground text-xs">
													{creator?.totalStars || 0} ★ •{" "}
													{(creator?.bio || "Component creator")
														.replace(/GitHub:\s*https?:\/\/[^\s•]+/g, "")
														.replace(/•\s*$/, "")
														.trim()}
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
					items={latestComponents?.components}
					isLoading={false}
					viewAllLink="/components"
					itemType="component"
					layout="carousel"
					skeletonCount={10}
					animationType="scale"
				/>

				{/* Why this exists section */}
				<div className="my-24">
					<div className="relative overflow-hidden rounded-2xl border bg-muted/50 p-8 md:p-12">
						<ShineBorder
							shineColor={[
								"var(--chart-4)",
								"var(--chart-5)",
								"var(--chart-1)",
							]}
						/>

						<div className="mb-16 space-y-6 text-center">
							<h2 className="font-bold text-3xl md:text-4xl">
								Why this exists
							</h2>
							<p className="mx-auto max-w-2xl text-muted-foreground text-xl">
								Because finding good ShadCN/UI components sucks.
							</p>
						</div>

						<div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
							{/* Problem Card */}
							<div className="group relative overflow-hidden rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/5 via-destructive/2 to-transparent p-8 transition-all hover:border-destructive/30 hover:shadow-destructive/5 hover:shadow-lg">
								<div className="-right-8 -top-8 absolute h-24 w-24 rounded-full bg-destructive/10 blur-xl transition-all group-hover:bg-destructive/15" />
								<div className="relative">
									<div className="mb-6 flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20 transition-all group-hover:bg-destructive/15 group-hover:ring-destructive/30">
											<AlertTriangle className="h-6 w-6 text-destructive" />
										</div>
										<h3 className="font-bold text-2xl">The Problem</h3>
									</div>
									<p className="text-lg text-muted-foreground leading-relaxed">
										You want a gradient card or a dashboard chart but instead
										you're crawling Reddit, Discord, npm, and some guy's Notion
										doc from 2022.
									</p>
									<div className="mt-6 flex items-center gap-2 font-medium text-destructive text-sm">
										<div className="h-1.5 w-1.5 rounded-full bg-destructive" />
										Frustrating developer experience
									</div>
								</div>
							</div>

							{/* Solution Card */}
							<div className="group relative overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 via-green-500/2 to-transparent p-8 transition-all hover:border-green-500/30 hover:shadow-green-500/5 hover:shadow-lg">
								<div className="-right-8 -top-8 absolute h-24 w-24 rounded-full bg-green-500/10 blur-xl transition-all group-hover:bg-green-500/15" />
								<div className="relative">
									<div className="mb-6 flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 ring-1 ring-green-500/20 transition-all group-hover:bg-green-500/15 group-hover:ring-green-500/30">
											<Sparkles className="h-6 w-6 text-green-500" />
										</div>
										<h3 className="font-bold text-2xl">The Solution</h3>
									</div>
									<p className="mb-8 text-lg text-muted-foreground leading-relaxed">
										This registry brings it all to one place:
									</p>

									<div className="space-y-6">
										<div className="flex items-start gap-4 rounded-xl bg-background/50 p-4 ring-1 ring-border/50 transition-all hover:ring-border">
											<div
												className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
												style={{
													backgroundColor:
														"color-mix(in srgb, var(--chart-1) 15%, transparent)",
												}}
											>
												<Eye
													className="h-5 w-5"
													style={{ color: "var(--chart-1)" }}
												/>
											</div>
											<div className="space-y-1">
												<h4 className="font-semibold">Live previews</h4>
												<p className="text-muted-foreground text-sm">
													(coming soon™)
												</p>
											</div>
										</div>

										<div className="flex items-start gap-4 rounded-xl bg-background/50 p-4 ring-1 ring-border/50 transition-all hover:ring-border">
											<div
												className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
												style={{
													backgroundColor:
														"color-mix(in srgb, var(--chart-2) 15%, transparent)",
												}}
											>
												<GitBranch
													className="h-5 w-5"
													style={{ color: "var(--chart-2)" }}
												/>
											</div>
											<div className="space-y-1">
												<h4 className="font-semibold">Complete metadata</h4>
												<p className="text-muted-foreground text-sm">
													GitHub metadata, install commands, and README in one
													view
												</p>
											</div>
										</div>

										<div className="flex items-start gap-4 rounded-xl bg-background/50 p-4 ring-1 ring-border/50 transition-all hover:ring-border">
											<div
												className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
												style={{
													backgroundColor:
														"color-mix(in srgb, var(--chart-3) 15%, transparent)",
												}}
											>
												<Filter
													className="h-5 w-5"
													style={{ color: "var(--chart-3)" }}
												/>
											</div>
											<div className="space-y-1">
												<h4 className="font-semibold">Actually works</h4>
												<p className="text-muted-foreground text-sm">
													Tags, categories, and filters that actually work
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-16 space-y-6 text-center">
							<p className="mx-auto max-w-3xl text-lg text-muted-foreground leading-relaxed">
								Components and tools live in separate spaces. Users can star,
								comment, and browse what others are using.
							</p>

							<div className="mx-auto max-w-2xl rounded-xl bg-muted/30 p-6">
								<p className="font-semibold text-foreground text-xl">
									This isn't a UI kit. It's the map of where the good stuff is.
								</p>
							</div>
						</div>
					</div>
				</div>

				<CollectionSection
					title="Popular Components"
					items={trendingComponents?.components}
					isLoading={false}
					viewAllLink="/components?sort=stars"
					itemType="component"
					layout="carousel"
					emptyMessage="No popular components available yet."
					skeletonCount={10}
					animationType="opacity"
				/>

				<CollectionSection
					title="Featured Tools"
					items={featuredTools?.tools}
					isLoading={false}
					viewAllLink="/tools"
					itemType="tool"
					layout="carousel"
					skeletonCount={10}
					animationType="grow-opacity"
				/>
			</div>
		</Container>
	);
}
