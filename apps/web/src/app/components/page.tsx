"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { SearchBar } from "@/components/features/search-bar"
import { FilterPanel } from "@/components/features/filter-panel"
import { ComponentCard } from "@/components/features/component-card"
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
const allComponents = [
  {
    id: "1",
    name: "Advanced Data Table",
    description: "A powerful data table with sorting, filtering, and pagination",
    category: "Tables",
    stars: 245,
    downloads: 1200,
    githubUrl: "https://github.com/example/data-table",
  },
  {
    id: "2",
    name: "Multi-Step Form",
    description: "Beautiful multi-step form with validation and progress tracking",
    category: "Forms",
    stars: 189,
    downloads: 890,
    githubUrl: "https://github.com/example/multi-step-form",
  },
  {
    id: "3",
    name: "Interactive Charts",
    description: "Responsive charts built with Recharts and shadcn/ui",
    category: "Charts",
    stars: 312,
    downloads: 1500,
    githubUrl: "https://github.com/example/charts",
  },
  {
    id: "4",
    name: "File Upload",
    description: "Drag and drop file upload with progress and preview",
    category: "Input",
    stars: 156,
    downloads: 670,
    githubUrl: "https://github.com/example/file-upload",
  },
  {
    id: "5",
    name: "Command Palette",
    description: "Fast command palette for navigation and actions",
    category: "Navigation",
    stars: 423,
    downloads: 2100,
    githubUrl: "https://github.com/example/command-palette",
  },
  {
    id: "6",
    name: "Rich Text Editor",
    description: "WYSIWYG editor with markdown support",
    category: "Input",
    stars: 378,
    downloads: 1800,
    githubUrl: "https://github.com/example/rich-editor",
  },
]

const filterGroups = [
  {
    id: "category",
    label: "Category",
    options: [
      { id: "tables", label: "Tables", count: 12 },
      { id: "forms", label: "Forms", count: 8 },
      { id: "charts", label: "Charts", count: 6 },
      { id: "input", label: "Input", count: 15 },
      { id: "navigation", label: "Navigation", count: 9 },
      { id: "layout", label: "Layout", count: 11 },
    ],
  },
  {
    id: "features",
    label: "Features",
    options: [
      { id: "responsive", label: "Responsive", count: 45 },
      { id: "accessible", label: "Accessible", count: 38 },
      { id: "dark-mode", label: "Dark Mode", count: 42 },
      { id: "typescript", label: "TypeScript", count: 50 },
    ],
  },
]

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredComponents = allComponents.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase())
    // Add filter logic here based on selectedFilters
    return matchesSearch
  })

  const sortedComponents = [...filteredComponents].sort((a, b) => {
    switch (sortBy) {
      case "stars":
        return b.stars - a.stars
      case "downloads":
        return b.downloads - a.downloads
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0 // latest - would use actual dates in real app
    }
  })

  const itemsPerPage = 12
  const totalPages = Math.ceil(sortedComponents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedComponents = sortedComponents.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Container>
      <div className="py-8">
        <PageTitle title="Components" subtitle="Discover shadcn/ui components for your projects" />

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <SearchBar
              placeholder="Search components..."
              onSearch={setSearchQuery}
              suggestions={["data table", "form", "chart", "calendar"]}
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
          {paginatedComponents.map((component) => (
            <ComponentCard key={component.id} {...component} />
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

        {paginatedComponents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No components found matching your criteria.</p>
          </div>
        )}
      </div>
    </Container>
  )
}
