"use client"

import Link from "next/link"
import { Star, Github, ExternalLink, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StarButton } from "./star-button"

interface ComponentCardProps {
  id: string
  name: string
  description: string
  category: string
  stars: number
  downloads: number
  githubUrl?: string
  websiteUrl?: string
  isStarred?: boolean
  onToggleStar?: () => void
}

export function ComponentCard({
  id,
  name,
  description,
  category,
  stars,
  downloads,
  githubUrl,
  websiteUrl,
  isStarred = false,
  onToggleStar,
}: ComponentCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link href={`/components/${id}`} className="hover:underline">
                {name}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>
          <StarButton isStarred={isStarred} onToggle={onToggleStar} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {stars}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {downloads}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/components/${id}`}>View Details</Link>
          </Button>
          {githubUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link href={githubUrl} target="_blank">
                <Github className="h-3 w-3" />
              </Link>
            </Button>
          )}
          {websiteUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link href={websiteUrl} target="_blank">
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
