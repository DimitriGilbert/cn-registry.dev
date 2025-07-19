"use client";
import { useQuery } from "@tanstack/react-query";
import { Eye, Heart, Package, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ComponentCard } from "@/components/features/component-card";
import { ToolCard } from "@/components/features/tool-card";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export default function Dashboard() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	// Fetch user dashboard data
	const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
		...trpc.users.getDashboard.queryOptions(),
		enabled: !!session?.user?.id,
	});

	// Fetch user's starred components
	const { data: starredComponents } = useQuery({
		...trpc.components.getStarred.queryOptions({ limit: 6 }),
		enabled: !!session?.user?.id,
	});

	// Fetch user's starred tools
	const { data: starredTools } = useQuery({
		...trpc.tools.getStarred.queryOptions({ limit: 6 }),
		enabled: !!session?.user?.id,
	});

	// Fetch user's recent activity
	const { data: recentActivity } = useQuery({
		...trpc.users.getActivity.queryOptions({ limit: 5 }),
		enabled: !!session?.user?.id,
	});

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending]);

	if (isPending || isDashboardLoading) {
		return (
			<Container>
				<div className="py-8">
					<div className="mb-8">
						<Skeleton className="mb-2 h-8 w-64" />
						<Skeleton className="h-4 w-96" />
					</div>
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card key={i}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-4" />
								</CardHeader>
								<CardContent>
									<Skeleton className="mb-2 h-8 w-16" />
									<Skeleton className="h-3 w-32" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</Container>
		);
	}

	const stats = dashboardData || {
		starredComponents: 0,
		starredTools: 0,
		commentsCount: 0,
		downloadsCount: 0,
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title={`Welcome back, ${session?.user.name}`}
					subtitle="Manage your components, tools, and track your activity"
				>
					<Button asChild>
						<Link href="/components">
							<span className="flex items-center">
								<Plus className="mr-2 h-4 w-4" />
								Browse Components
							</span>
						</Link>
					</Button>
				</PageTitle>

				{/* Stats Overview */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Starred Components
							</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{stats.starredComponents}
							</div>
							<p className="text-muted-foreground text-xs">
								Components you've starred
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Starred Tools
							</CardTitle>
							<Star className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stats.starredTools}</div>
							<p className="text-muted-foreground text-xs">
								Tools you've starred
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Comments</CardTitle>
							<Heart className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stats.commentsCount}</div>
							<p className="text-muted-foreground text-xs">
								Comments you've made
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Downloads</CardTitle>
							<Eye className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stats.downloadsCount}</div>
							<p className="text-muted-foreground text-xs">
								Total downloads tracked
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Starred Components */}
					<Card>
						<CardHeader>
							<CardTitle>Starred Components</CardTitle>
							<CardDescription>
								Components you've bookmarked for later
							</CardDescription>
						</CardHeader>
						<CardContent>
							{(starredComponents?.length ?? 0) > 0 ? (
								<div className="space-y-4">
									{starredComponents?.slice(0, 3).map((component) => (
										<div
											key={component.id}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div className="flex-1">
												<h4 className="font-medium">
													<Link
														href={`/components/${component.id}`}
														className="hover:underline"
													>
														{component.name}
													</Link>
												</h4>
												<p className="text-muted-foreground text-sm">
													{component.description}
												</p>
												<div className="mt-1 flex items-center gap-2">
													{component.categories
														?.filter((cat): cat is NonNullable<typeof cat> =>
															Boolean(cat),
														)
														.slice(0, 2)
														.map((category) => (
															<Badge
																key={category.id}
																variant="outline"
																className="text-xs"
															>
																{category.name}
															</Badge>
														))}
												</div>
											</div>
											<div className="flex items-center gap-1 text-muted-foreground text-sm">
												<Star className="h-3 w-3" />
												{component.starsCount || 0}
											</div>
										</div>
									))}
									{(starredComponents?.length ?? 0) > 3 && (
										<div className="pt-2 text-center">
											<Button variant="outline" size="sm" asChild>
												<Link href="/components?starred=true">
													View All ({starredComponents?.length ?? 0})
												</Link>
											</Button>
										</div>
									)}
								</div>
							) : (
								<div className="py-8 text-center text-muted-foreground">
									<Package className="mx-auto mb-2 h-12 w-12 opacity-50" />
									<p>No starred components yet</p>
									<Button variant="outline" size="sm" className="mt-2" asChild>
										<Link href="/components">Browse Components</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Starred Tools */}
					<Card>
						<CardHeader>
							<CardTitle>Starred Tools</CardTitle>
							<CardDescription>
								Tools you've bookmarked for later
							</CardDescription>
						</CardHeader>
						<CardContent>
							{(starredTools?.length ?? 0) > 0 ? (
								<div className="space-y-4">
									{starredTools?.slice(0, 3).map((tool) => (
										<div
											key={tool.id}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div className="flex-1">
												<h4 className="font-medium">
													<Link
														href={`/tools/${tool.id}`}
														className="hover:underline"
													>
														{tool.name}
													</Link>
												</h4>
												<p className="text-muted-foreground text-sm">
													{tool.description}
												</p>
												<div className="mt-1 flex items-center gap-2">
													{tool.categories
														?.filter((cat): cat is NonNullable<typeof cat> =>
															Boolean(cat),
														)
														.slice(0, 2)
														.map((category) => (
															<Badge
																key={category.id}
																variant="outline"
																className="text-xs"
															>
																{category.name}
															</Badge>
														))}
												</div>
											</div>
											<div className="flex items-center gap-1 text-muted-foreground text-sm">
												<Star className="h-3 w-3" />
												{tool.starsCount || 0}
											</div>
										</div>
									))}
									{(starredTools?.length ?? 0) > 3 && (
										<div className="pt-2 text-center">
											<Button variant="outline" size="sm" asChild>
												<Link href="/tools?starred=true">
													View All ({starredTools?.length ?? 0})
												</Link>
											</Button>
										</div>
									)}
								</div>
							) : (
								<div className="py-8 text-center text-muted-foreground">
									<Star className="mx-auto mb-2 h-12 w-12 opacity-50" />
									<p>No starred tools yet</p>
									<Button variant="outline" size="sm" className="mt-2" asChild>
										<Link href="/tools">Browse Tools</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Your latest interactions and updates
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{(recentActivity?.length ?? 0) > 0 ? (
								recentActivity?.map((activity) => (
									<div
										key={activity.id}
										className="flex items-center gap-4 rounded-lg border p-4"
									>
										<div className="flex-shrink-0">
											{activity.type === "star" ? (
												<Star className="h-5 w-5 text-yellow-500" />
											) : activity.type === "comment" ? (
												<Heart className="h-5 w-5 text-red-500" />
											) : (
												<Eye className="h-5 w-5 text-blue-500" />
											)}
										</div>
										<div className="flex-1">
											<p className="font-medium">{activity.description}</p>
											<p className="text-muted-foreground text-sm">
												{formatDate(activity.createdAt)}
											</p>
										</div>
									</div>
								))
							) : (
								<div className="py-8 text-center text-muted-foreground">
									<Heart className="mx-auto mb-2 h-12 w-12 opacity-50" />
									<p>No recent activity</p>
									<p className="text-sm">
										Start exploring components and tools to see your activity
										here
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</Container>
	);
}
