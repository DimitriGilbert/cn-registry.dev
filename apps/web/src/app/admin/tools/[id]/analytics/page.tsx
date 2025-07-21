"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	Download,
	Eye,
	MessageSquare,
	Star,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import {
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Container } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

export default function ToolAnalyticsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);

	// Get tool details
	const { data: tool } = useQuery(trpc.tools.getById.queryOptions({ id }));

	// Get analytics data
	const { data: analytics, isLoading } = useQuery(
		trpc.analytics.getToolAnalytics.queryOptions({
			toolId: id,
			period: "month",
		}),
	);

	// Get referrer data
	const { data: referrerAnalytics } = useQuery(
		trpc.analytics.getReferrerData.queryOptions({
			itemId: id,
			itemType: "tool",
			period: "month",
		}),
	);

	if (isLoading || !tool || !analytics) {
		return (
			<Container>
				<div className="py-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-64 rounded bg-muted" />
						<div className="h-4 w-96 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={`tool-analytics-skeleton-${i}`}
									className="h-32 rounded bg-muted"
								/>
							))}
						</div>
					</div>
				</div>
			</Container>
		);
	}

	const { kpis, timeSeriesData, topStarUsers, topCommentUsers } = analytics;

	// Format time series data for charts
	const chartData = timeSeriesData.map((item) => ({
		date: new Date(item.date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		}),
		views: item.views,
		installs: item.installs,
	}));

	// Create combined user data for top engaged users
	const topEngagedUsers = [
		...topStarUsers.map((item) => ({
			name: item.user.name || item.user.username || "Unknown",
			stars: 1,
			comments: 0,
			lastActive: new Date(item.starredAt).toLocaleDateString(),
		})),
		...topCommentUsers.map((item) => ({
			name: item.user.name || item.user.username || "Unknown",
			stars: 0,
			comments: item.commentCount,
			lastActive: new Date(item.lastComment).toLocaleDateString(),
		})),
	]
		.reduce(
			(
				acc: {
					name: string;
					stars: number;
					comments: number;
					lastActive: string;
				}[],
				user,
			) => {
				const existing = acc.find((u) => u.name === user.name);
				if (existing) {
					existing.stars += user.stars;
					existing.comments += user.comments;
					existing.lastActive =
						new Date(existing.lastActive) > new Date(user.lastActive)
							? existing.lastActive
							: user.lastActive;
				} else {
					acc.push(user);
				}
				return acc;
			},
			[],
		)
		.slice(0, 5);

	// Get real referrer data or fallback to basic data if none available
	const referrerData = referrerAnalytics?.referrerData || [
		{
			source: "Direct",
			visits: kpis.totalViews || 1,
			color: "#8884d8",
		},
	];

	return (
		<Container>
			<div className="py-8">
				<div className="mb-6">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink href="/admin/tools">Tools</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{tool.name} Analytics</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				<PageTitle
					title={`${tool.name} Analytics`}
					subtitle="Detailed performance metrics and user engagement"
				>
					<div className="flex items-center gap-2">
						{tool.categories
							?.filter((category): category is NonNullable<typeof category> =>
								Boolean(category),
							)
							.map((category) => (
								<Badge key={category.id} variant="secondary">
									{category.name}
								</Badge>
							))}
						<Button variant="outline" asChild>
							<Link href="/admin/tools">
								<span className="flex items-center">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Tools
								</span>
							</Link>
						</Button>
					</div>
				</PageTitle>

				{/* KPI Cards */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Total Views</CardTitle>
							<Eye className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{kpis.totalViews.toLocaleString()}
							</div>
							<p className="flex items-center text-muted-foreground text-xs">
								{kpis.viewsChange > 0 ? (
									<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
								) : (
									<TrendingDown className="mr-1 h-3 w-3 text-red-500" />
								)}
								<span
									className={
										kpis.viewsChange > 0 ? "text-green-600" : "text-red-600"
									}
								>
									{Math.abs(kpis.viewsChange)}%
								</span>{" "}
								from last period
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Total Installs
							</CardTitle>
							<Download className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{kpis.totalInstalls.toLocaleString()}
							</div>
							<p className="flex items-center text-muted-foreground text-xs">
								{kpis.installsChange > 0 ? (
									<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
								) : (
									<TrendingDown className="mr-1 h-3 w-3 text-red-500" />
								)}
								<span
									className={
										kpis.installsChange > 0 ? "text-green-600" : "text-red-600"
									}
								>
									{Math.abs(kpis.installsChange)}%
								</span>{" "}
								from last period
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Total Stars</CardTitle>
							<Star className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{kpis.totalStars}</div>
							<p className="flex items-center text-muted-foreground text-xs">
								<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
								<span className="text-green-600">{kpis.starsChange}%</span>{" "}
								cumulative
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Total Comments
							</CardTitle>
							<MessageSquare className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{kpis.totalComments}</div>
							<p className="flex items-center text-muted-foreground text-xs">
								<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
								<span className="text-green-600">{kpis.commentsChange}%</span>{" "}
								cumulative
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Views and Installs Over Time */}
					<Card>
						<CardHeader>
							<CardTitle>Views & Installs Over Time</CardTitle>
							<CardDescription>
								Daily views and installs for the past month
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer
								config={{
									views: {
										label: "Views",
										color: "hsl(var(--chart-1))",
									},
									installs: {
										label: "Installs",
										color: "hsl(var(--chart-2))",
									},
								}}
								className="h-[300px]"
							>
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date" />
										<YAxis />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Line
											type="monotone"
											dataKey="views"
											stroke="var(--color-views)"
											strokeWidth={2}
										/>
										<Line
											type="monotone"
											dataKey="installs"
											stroke="var(--color-installs)"
											strokeWidth={2}
										/>
									</LineChart>
								</ResponsiveContainer>
							</ChartContainer>
						</CardContent>
					</Card>

					{/* Traffic Sources */}
					<Card>
						<CardHeader>
							<CardTitle>Traffic Sources</CardTitle>
							<CardDescription>
								Estimated distribution of traffic sources
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer
								config={{
									visits: {
										label: "Visits",
									},
								}}
								className="h-[300px]"
							>
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={referrerData}
											cx="50%"
											cy="50%"
											innerRadius={60}
											outerRadius={120}
											paddingAngle={5}
											dataKey="visits"
										>
											{referrerData.map((entry) => (
												<Cell key={`cell-${entry.source}`} fill={entry.color} />
											))}
										</Pie>
										<ChartTooltip content={<ChartTooltipContent />} />
									</PieChart>
								</ResponsiveContainer>
							</ChartContainer>
							<div className="mt-4 grid grid-cols-1 gap-2">
								{referrerData.map((source) => (
									<div
										key={source.source}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<div
												className="h-3 w-3 rounded-full"
												style={{ backgroundColor: source.color }}
											/>
											<span className="text-sm">{source.source}</span>
										</div>
										<span className="font-medium text-sm">{source.visits}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Top Engaged Users */}
				{topEngagedUsers.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Top Engaged Users</CardTitle>
							<CardDescription>
								Users with the most stars and comments
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Stars Given</TableHead>
										<TableHead>Comments</TableHead>
										<TableHead>Last Active</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{topEngagedUsers.map((user, index) => (
										<TableRow key={`${user.name}-${index}`}>
											<TableCell className="font-medium">{user.name}</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Star className="h-3 w-3 text-yellow-500" />
													{user.stars}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<MessageSquare className="h-3 w-3 text-blue-500" />
													{user.comments}
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{user.lastActive}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}

				{topEngagedUsers.length === 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Top Engaged Users</CardTitle>
							<CardDescription>
								Users with the most stars and comments
							</CardDescription>
						</CardHeader>
						<CardContent className="py-8 text-center">
							<p className="text-muted-foreground">
								No user engagement data available yet. Stars and comments will
								appear here once users start interacting with this tool.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</Container>
	);
}
