"use client";

import { useQuery } from "@tanstack/react-query";
import {
	MessageSquare,
	Package,
	Plus,
	Star,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

// Simple date formatting function
const formatDate = (date: string | Date) => {
	const d = new Date(date);
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatChartDate = (date: string | Date) => {
	const d = new Date(date);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function AdminDashboard() {
	// Fetch dashboard data
	const { data: dashboardData, isLoading: isDashboardLoading } = useQuery(
		trpc.admin.getDashboard.queryOptions(),
	);

	// Fetch recent notifications
	const { data: notificationsData } = useQuery(
		trpc.admin.getNotifications.queryOptions({ page: 1, limit: 5 }),
	);

	// Fetch analytics summary for the last 30 days
	const { data: analyticsData } = useQuery(
		trpc.analytics.getSummary.queryOptions({
			startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
			endDate: new Date().toISOString(),
		}),
	);

	if (isDashboardLoading) {
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

	const stats = dashboardData?.stats || {
		usersCount: 0,
		componentsCount: 0,
		toolsCount: 0,
		unreadNotificationsCount: 0,
	};

	const notifications = notificationsData?.notifications || [];

	return (
		<Container>
			<div className="py-8">
				<PageTitle
					title="Admin Dashboard"
					subtitle="Overview of cn-registry analytics and management"
				>
					<Button asChild>
						<Link href="/admin/components/new">
							<span className="flex items-center">
								<Plus className="mr-2 h-4 w-4" />
								Add Component
							</span>
						</Link>
					</Button>
				</PageTitle>

				{/* Stats Overview */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Components</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stats.componentsCount}</div>
							<p className="text-muted-foreground text-xs">
								Total components in registry
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Tools</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stats.toolsCount}</div>
							<p className="text-muted-foreground text-xs">
								Total tools available
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Users</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{stats.usersCount.toLocaleString()}
							</div>
							<p className="text-muted-foreground text-xs">Registered users</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Notifications
							</CardTitle>
							<MessageSquare className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{stats.unreadNotificationsCount}
							</div>
							<p className="text-muted-foreground text-xs">
								Unread notifications
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Analytics Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Analytics Overview</CardTitle>
							<CardDescription>
								Platform activity over the last 30 days
							</CardDescription>
						</CardHeader>
						<CardContent>
							{analyticsData?.dailyStats ? (
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
										<LineChart
											data={analyticsData.dailyStats.map((stat) => ({
												date: formatChartDate(stat.date),
												views: stat.views,
												installs: stat.installs,
											}))}
										>
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
							) : (
								<div className="flex h-[300px] items-center justify-center text-muted-foreground">
									No analytics data available
								</div>
							)}
						</CardContent>
					</Card>

					{/* Event Types Distribution */}
					<Card>
						<CardHeader>
							<CardTitle>Event Distribution</CardTitle>
							<CardDescription>Breakdown of user actions</CardDescription>
						</CardHeader>
						<CardContent>
							{analyticsData?.eventCounts ? (
								<ChartContainer
									config={{
										count: {
											label: "Events",
										},
									}}
									className="h-[300px]"
								>
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={analyticsData.eventCounts.map((event, index) => ({
													name: event.eventType,
													value: event.count,
													color: `hsl(var(--chart-${(index % 5) + 1}))`,
												}))}
												cx="50%"
												cy="50%"
												innerRadius={60}
												outerRadius={120}
												paddingAngle={5}
												dataKey="value"
											>
												{analyticsData.eventCounts.map((_, index) => (
													<Cell
														key={`cell-${index}`}
														fill={`hsl(var(--chart-${(index % 5) + 1}))`}
													/>
												))}
											</Pie>
											<ChartTooltip content={<ChartTooltipContent />} />
										</PieChart>
									</ResponsiveContainer>
								</ChartContainer>
							) : (
								<div className="flex h-[300px] items-center justify-center text-muted-foreground">
									No event data available
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Recent Notifications */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Notifications</CardTitle>
						<CardDescription>
							Latest system notifications and alerts
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{notifications.length > 0 ? (
								notifications.map((notification) => (
									<div
										key={notification.id}
										className="flex items-center gap-4 rounded-lg border p-4"
									>
										<div className="flex-shrink-0">
											<MessageSquare
												className={`h-5 w-5 ${
													notification.isRead
														? "text-muted-foreground"
														: "text-blue-500"
												}`}
											/>
										</div>
										<div className="flex-1">
											<h4 className="font-medium">Notification</h4>
											<p className="text-muted-foreground text-sm">
												{notification.message}
											</p>
											<p className="mt-1 text-muted-foreground text-xs">
												{formatDate(notification.createdAt)}
											</p>
										</div>
										<div className="flex-shrink-0">
											{/* <Badge variant={notification.type === 'error' ? 'destructive' : 
                                    notification.type === 'warning' ? 'secondary' : 'default'}>
                        {notification.type}
                      </Badge> */}
										</div>
									</div>
								))
							) : (
								<div className="py-8 text-center text-muted-foreground">
									No notifications available
								</div>
							)}
						</div>
						{notifications.length > 0 && (
							<div className="mt-4 text-center">
								<Button variant="outline" asChild>
									<Link href="/admin/notifications">
										View All Notifications
									</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</Container>
	);
}
