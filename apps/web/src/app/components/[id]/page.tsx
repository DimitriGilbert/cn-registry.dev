import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { StarButton } from "@/components/features/star-button"
import { CopyInstallCommand } from "@/components/features/copy-install-command"
import { RepoStats } from "@/components/features/repo-stats"
import { ReadmeViewer } from "@/components/features/readme-viewer"
import { Showcase } from "@/components/features/showcase"
import { CommentList } from "@/components/features/comment-list"
import { CommentForm } from "@/components/features/comment-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mock data
const componentData = {
  id: "1",
  name: "Advanced Data Table",
  description: "A powerful data table with sorting, filtering, and pagination built with shadcn/ui components",
  category: "Tables",
  stars: 245,
  downloads: 1200,
  githubUrl: "https://github.com/example/data-table",
  websiteUrl: "https://example.com/data-table",
  installCommand: "npx shadcn@latest add data-table",
  repoStats: {
    stars: 245,
    forks: 42,
    issues: 8,
    watchers: 156,
  },
  readme: `
    <h1>Advanced Data Table</h1>
    <p>A comprehensive data table component built with shadcn/ui that provides:</p>
    <ul>
      <li>Sorting by columns</li>
      <li>Advanced filtering</li>
      <li>Pagination</li>
      <li>Row selection</li>
      <li>Responsive design</li>
    </ul>
    <h2>Installation</h2>
    <pre><code>npx shadcn@latest add data-table</code></pre>
    <h2>Usage</h2>
    <pre><code>import { DataTable } from "@/components/ui/data-table"</code></pre>
  `,
}

const mockComments = [
  {
    id: "1",
    author: { name: "John Doe", avatar: "/placeholder-user.jpg" },
    content: "This is an amazing component! Really well designed and easy to use.",
    timestamp: "2 hours ago",
    likes: 5,
    replies: [
      {
        id: "2",
        author: { name: "Jane Smith", avatar: "/placeholder-user.jpg" },
        content: "I agree! The API is very intuitive.",
        timestamp: "1 hour ago",
        likes: 2,
      },
    ],
  },
  {
    id: "3",
    author: { name: "Bob Wilson", avatar: "/placeholder-user.jpg" },
    content: "Would love to see more examples with different data types.",
    timestamp: "4 hours ago",
    likes: 3,
  },
]

const ExampleComponent = () => (
  <div className="p-4 border rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Sample Data Table</h3>
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-4 p-2 bg-muted rounded">
        <div className="font-medium">Name</div>
        <div className="font-medium">Email</div>
        <div className="font-medium">Role</div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-2">
        <div>John Doe</div>
        <div>john@example.com</div>
        <div>Admin</div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-2">
        <div>Jane Smith</div>
        <div>jane@example.com</div>
        <div>User</div>
      </div>
    </div>
  </div>
)

const exampleCode = `import { DataTable } from "@/components/ui/data-table"

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
]

const data = [
  { name: "John Doe", email: "john@example.com", role: "Admin" },
  { name: "Jane Smith", email: "jane@example.com", role: "User" },
]

export function Example() {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      sortable 
      filterable 
      paginated 
    />
  )
}`

export default function ComponentDetailPage({ params }: { params: { id: string } }) {
  const [isStarred, setIsStarred] = useState(false)
  const [comments, setComments] = useState(mockComments)

  const handleAddComment = (content: string, parentId?: string) => {
    const newComment = {
      id: Date.now().toString(),
      author: { name: "Current User", avatar: "/placeholder-user.jpg" },
      content,
      timestamp: "Just now",
      likes: 0,
    }

    if (parentId) {
      // Add as reply
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId ? { ...comment, replies: [...(comment.replies || []), newComment] } : comment,
        ),
      )
    } else {
      // Add as new comment
      setComments((prev) => [newComment, ...prev])
    }
  }

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : {
              ...comment,
              replies: comment.replies?.map((reply) =>
                reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply,
              ),
            },
      ),
    )
  }

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{componentData.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-8">
          <PageTitle title={componentData.name} subtitle={componentData.description}>
            <div className="flex items-center gap-2">
              <StarButton isStarred={isStarred} onToggle={() => setIsStarred(!isStarred)} size="default" />
              <Button variant="outline" asChild>
                <Link href="/components">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Components
                </Link>
              </Button>
            </div>
          </PageTitle>

          <div className="flex items-center gap-4 mb-6">
            <Badge variant="secondary">{componentData.category}</Badge>
            <div className="flex items-center gap-2">
              {componentData.githubUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={componentData.githubUrl} target="_blank">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Link>
                </Button>
              )}
              {componentData.websiteUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={componentData.websiteUrl} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <CopyInstallCommand command={componentData.installCommand} />
              <RepoStats {...componentData.repoStats} />

              <Tabs defaultValue="readme" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="readme">README</TabsTrigger>
                  <TabsTrigger value="showcase">Showcase</TabsTrigger>
                </TabsList>
                <TabsContent value="readme" className="mt-6">
                  <ReadmeViewer content={componentData.readme} />
                </TabsContent>
                <TabsContent value="showcase" className="mt-6">
                  <Showcase component={<ExampleComponent />} code={exampleCode} title="Interactive Preview" />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <CommentForm onSubmit={handleAddComment} />
              <CommentList comments={comments} onAddComment={handleAddComment} onLikeComment={handleLikeComment} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
