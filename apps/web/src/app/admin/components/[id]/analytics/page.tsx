"use client"

import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Eye, Download, Star, MessageSquare, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data
const componentData = {
  id: "1",
  name: "Advanced Data Table",
  category: "Tables",
}

const kpiData = {
  totalViews: 12450,
  totalInstalls: 3420,
  totalStars: 245,
  totalComments: 18,
  viewsChange: 12.5,
  installsChange: -3.2,
  starsChange: 8.7,
  commentsChange: 25.0,
}

const viewsOverTime = [
  { date: "2024-01-01", views: 120, installs: 45 },
  { date: "2024-01-02", views: 150, installs: 52 },
  { date: "2024-01-03", views: 180, installs: 38 },
  { date: "2024-01-04", views: 220, installs: 67 },
  { date: "2024-01-05", views: 190, installs: 43 },
  { date: "2024-01-06", views: 250, installs: 78 },
  { date: "2024-01-07", views: 280, installs: 89 },
]

const referrerData = [
  { source: "GitHub", visits: 450, color: "hsl(var(--chart-1))" },
  { source: "Direct", visits: 320, color: "hsl(var(--chart-2))" },
  { source: "Twitter", visits: 180, color: "hsl(var(--chart-3))" },
  { source: "Reddit", visits: 120, color: "hsl(var(--chart-4))" },
  { source: "Other", visits: 80, color: "hsl(var(--chart-5))" },
]

const topUsers = [
  { name: "John Doe", stars: 5, comments: 3, lastActive: "2 hours ago" },
  { name: "Jane Smith", stars: 3, comments: 7, lastActive: "1 day ago" },
  { name: "Bob Wilson", stars: 4, comments: 2, lastActive: "3 days ago" },
  { name: "Alice Johnson", stars: 2, comments: 5, lastActive: "1 week ago" },
  { name: "Charlie Brown", stars: 1, comments: 4, lastActive: "2 weeks ago" },
]

export default function ComponentAnalyticsPage({ params }: { params: { id: string } }) {
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
                <BreadcrumbLink href="/admin/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{componentData.name} Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <PageTitle
          title={`${componentData.name} Analytics`}
          subtitle="Detailed performance metrics and user engagement"
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{componentData.category}</Badge>
            <Button variant="outline" asChild>
              <Link href="/admin/components">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Components
              </Link>
            </Button>
          </div>
        </PageTitle>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {kpiData.viewsChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={kpiData.viewsChange > 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(kpiData.viewsChange)}%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.totalInstalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {kpiData.installsChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={kpiData.installsChange > 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(kpiData.installsChange)}%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.totalStars}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600">{kpiData.starsChange}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.totalComments}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600">{kpiData.commentsChange}%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Views and Installs Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Views & Installs Over Time</CardTitle>
              <CardDescription>Daily views and installs for the past week</CardDescription>
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
                  <LineChart data={viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                    <Line type="monotone" dataKey="installs" stroke="var(--color-installs)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
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
                      {referrerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="grid grid-cols-1 gap-2 mt-4">
                {referrerData.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="text-sm">{source.source}</span>
                    </div>
                    <span className="text-sm font-medium">{source.visits}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Engaged Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Engaged Users</CardTitle>
            <CardDescription>Users with the most stars and comments</CardDescription>
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
                {topUsers.map((user, index) => (
                  <TableRow key={index}>
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
                    <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
