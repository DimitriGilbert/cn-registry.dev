"use client"
import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { StarButton } from "@/components/features/star-button"
import { CopyInstallCommand } from "@/components/features/copy-install-command"
import { RepoStats } from "@/components/features/repo-stats"
import { ReadmeViewer } from "@/components/features/readme-viewer"
import { CommentList } from "@/components/features/comment-list"
import { CommentForm } from "@/components/features/comment-form"
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
const toolData = {
  id: "1",
  name: "shadcn/ui CLI",
  description: "Official CLI tool for adding components to your project with ease",
  category: "CLI Tools",
  stars: 1200,
  downloads: 5000,
  githubUrl: "https://github.com/shadcn/ui",
  websiteUrl: "https://ui.shadcn.com",
  installCommand: "npx shadcn@latest init",
  repoStats: {
    stars: 1200,
    forks: 180,
    issues: 15,
    watchers: 890,
  },
  readme: `
    <h1>shadcn/ui CLI</h1>
    <p>The official command-line interface for shadcn/ui components.</p>
    <h2>Features</h2>
    <ul>
      <li>Initialize new projects with shadcn/ui</li>
      <li>Add individual components to your project</li>
      <li>Update existing components</li>
      <li>Manage dependencies automatically</li>
    </ul>
    <h2>Installation</h2>
    <pre><code>npx shadcn@latest init</code></pre>
    <h2>Usage</h2>
    <pre><code>npx shadcn@latest add button</code></pre>
  `,
}

const mockComments = [
  {
    id: "1",
    author: { name: "Developer Mike", avatar: "/placeholder-user.jpg" },
    content: "This CLI tool is a game changer! Makes adding components so much easier.",
    timestamp: "3 hours ago",
    likes: 8,
  },
  {
    id: "2",
    author: { name: "Sarah Chen", avatar: "/placeholder-user.jpg" },
    content: "Love how it handles dependencies automatically. No more manual setup!",
    timestamp: "1 day ago",
    likes: 12,
    replies: [
      {
        id: "3",
        author: { name: "Alex Johnson", avatar: "/placeholder-user.jpg" },
        content: "Agreed! The dependency management is fantastic.",
        timestamp: "20 hours ago",
        likes: 4,
      },
    ],
  },
]

export default function ToolDetailPage({ params }: { params: { id: string } }) {
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
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId ? { ...comment, replies: [...(comment.replies || []), newComment] } : comment,
        ),
      )
    } else {
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
                <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{toolData.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-8">
          <PageTitle title={toolData.name} subtitle={toolData.description}>
            <div className="flex items-center gap-2">
              <StarButton isStarred={isStarred} onToggle={() => setIsStarred(!isStarred)} size="default" />
              <Button variant="outline" asChild>
                <Link href="/tools">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tools
                </Link>
              </Button>
            </div>
          </PageTitle>

          <div className="flex items-center gap-4 mb-6">
            <Badge variant="secondary">{toolData.category}</Badge>
            <div className="flex items-center gap-2">
              {toolData.githubUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={toolData.githubUrl} target="_blank">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Link>
                </Button>
              )}
              {toolData.websiteUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={toolData.websiteUrl} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {toolData.installCommand && <CopyInstallCommand command={toolData.installCommand} />}
              <RepoStats {...toolData.repoStats} />
              <ReadmeViewer content={toolData.readme} />
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
