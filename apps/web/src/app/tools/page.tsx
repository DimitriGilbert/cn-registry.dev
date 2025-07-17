"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { SearchBar } from "@/components/features/search-bar"
import { FilterPanel } from "@/components/features/filter-panel"
import { ToolCard } from "@/components/features/tool-card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
const allTools = [
  {
    id: "1",
    name: "shadcn/ui CLI",
    description: "Official CLI tool for adding components to your project",
    category: "CLI Tools",
    stars: 1200,
    downloads: 5000,
    githubUrl: "https://github.com/shadcn/ui",
    installCommand: "npx shadcn@latest init",
  },
  {
    id: "2",
    name: "Tailwind Config Generator",
    description: "Generate Tailwind CSS configurations for shadcn/ui themes",
    category: "Configuration",
    stars: 456,
    downloads: 2300,
    githubUrl: "https://github.com/example/tailwind-config",
    installCommand: "npm install tailwind-config-generator",
  },
  {
    id: "3",
    name: "Component Analyzer",
    description: "Analyze and optimize your shadcn/ui component usage",
    category: "Analysis",
    stars: 234,
    downloads: 890,
    githubUrl: "https://github.com/example/analyzer",
    installCommand: "npm install component-analyzer",
  },
  {
    id: "4",
    name: "Theme Builder",
    description: "Visual theme builder for shadcn/ui components",
    category: "Design Tools",
    stars: 567,
    downloads: 1800,
    githubUrl: "https://github.com/example/theme-builder",
    websiteUrl: "https://theme-builder.example.com",
  },
  {
    id: "5",
    name: "Component Storybook",
    description: "Storybook addon for shadcn/ui components",
    category: "Development",
    stars: 345,
    downloads: 1200,
    githubUrl: "https://github.com/example/storybook-addon",
    installCommand: "npm install @storybook/addon-shadcn",
  },
  {
    id: "6",
    name: "VS Code Extension",
    description: "IntelliSense and snippets for shadcn/ui in VS Code",
    category: "Editor Extensions",
    stars: 789,
    downloads: 3400,
    githubUrl: "https://github.com/example/vscode-extension",
  },
]

const filterGroups = [
  {
    id: "category",
    label: "Category",
    options: [
      { id: "cli-tools", label: "CLI Tools", count: 8 },
      { id: "configuration", label: "Configuration", count: 5 },
      { id: "analysis", label: "Analysis", count: 3 },
      { id: "design-tools", label: "Design Tools", count: 7 },
      { id: "development", label: "Development", count: 12 },
      { id: "editor-extensions", label: "Editor Extensions", count: 4 },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    options: [
      { id: "web", label: "Web", count: 25 },
      { id: "desktop", label: "Desktop", count: 8 },
      { id: "cli", label: "Command Line", count: 12 },
      { id: "vscode", label: "VS Code", count: 6 },
    ],
  },
]

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case "stars":
        return b.stars - a.stars
      case "downloads":
        return (b.downloads || 0) - (a.downloads || 0)
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const itemsPerPage = 12
  const totalPages = Math.ceil(sortedTools.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTools = sortedTools.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Container>
      <div className="py-8">
        <PageTitle title="Developer Tools" subtitle="Discover tools to enhance your shadcn/ui workflow" />

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <SearchBar
              placeholder="Search tools..."
              onSearch={setSearchQuery}
              suggestions={["cli", "theme", "storybook", "vscode"]}
            />
          </div>
          <div className="flex items-center gap-4">
            <FilterPanel
              filterGroups={filterGroups}
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="stars">Most Stars</SelectItem>
                <SelectItem value="downloads">Most Downloads</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedTools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink href="#" isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {paginatedTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tools found matching your criteria.</p>
          </div>
        )}
      </div>
    </Container>
  )
}
