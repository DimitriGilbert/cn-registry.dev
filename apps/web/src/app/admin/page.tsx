import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Package, Users, MessageSquare, Star, Plus } from "lucide-react"
import Link from "next/link"

// Mock data
const statsData = {
  totalComponents: 156,
  totalTools: 42,
  totalUsers: 2847,
  totalComments: 1293,
  totalStars: 8456,
  totalViews: 45678,
  totalDownloads: 23456,
}

const viewsData = [
  { name: "Mon", views: 1200 },
  { name: "Tue", views: 1900 },
  { name: "Wed", views: 800 },
  { name: "Thu", views: 2400 },
  { name: "Fri", views: 1800 },
  { name: "Sat", views: 1600 },
  { name: "Sun", views: 2200 },
]

const categoryData = [
  { name: "Forms", value: 25, color: "hsl(var(--chart-1))" },
  { name: "Tables", value: 20, color: "hsl(var(--chart-2))" },
  { name: "Navigation", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Input", value: 18, color: "hsl(var(--chart-4))" },
  { name: "Layout", value: 12, color: "hsl(var(--chart-5))" },
  { name: "Other", value: 10, color: "hsl(var(--muted))" },
]

const recentActivity = [
  {
    id: "1",
    type: "component",
    action: "created",
    item: "Advanced Data Table",
    user: "John Doe",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "tool",
    action: "updated",
    item: "Theme Builder",
    user: "Jane Smith",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    type: "component",
    action: "starred",
    item: "Multi-Step Form",
    user: "Bob Wilson",
    timestamp: "6 hours ago",
  },
  {
    id: "4",
    type: "comment",
    action: "posted",
    item: "Interactive Charts",
    user: "Alice Johnson",
    timestamp: "8 hours ago",
  },
]

export default function AdminDashboard() {
  return (
    <Container>
      <div className="py-8">
        <PageTitle title="Admin Dashboard" subtitle="Overview of cn-registry analytics and management">
          <Button asChild>
            <Link href="/admin/components/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Link>
          </Button>
        </PageTitle>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Components</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalComponents}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tools</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalTools}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+23%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalStars.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Views This Week</CardTitle>
              <CardDescription>Daily page views across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  views: {
                    label: "Views",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Component Categories</CardTitle>
              <CardDescription>Distribution of components by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Components",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm">{category.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{category.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === "component" && <Package className="h-5 w-5 text-blue-500" />}
                    {activity.type === "tool" && <Package className="h-5 w-5 text-green-500" />}
                    {activity.type === "comment" && <MessageSquare className="h-5 w-5 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
