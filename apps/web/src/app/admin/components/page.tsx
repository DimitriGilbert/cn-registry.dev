"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { SearchBar } from "@/components/features/search-bar"
import { FilterPanel } from "@/components/features/filter-panel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { MoreHorizontal, Plus, Edit, BarChart3, Trash2, Eye } from "lucide-react"
import Link from "next/link"

// Mock data
const components = [
  {
    id: "1",
    name: "Advanced Data Table",
    category: "Tables",
    created: "2024-01-15",
    stars: 245,
    views: 1200,
    status: "published",
  },
  {
    id: "2",
    name: "Multi-Step Form",
    category: "Forms",
    created: "2024-01-14",
    stars: 189,
    views: 890,
    status: "published",
  },
  {
    id: "3",
    name: "Interactive Charts",
    category: "Charts",
    created: "2024-01-13",
    stars: 312,
    views: 1500,
    status: "published",
  },
  {
    id: "4",
    name: "File Upload",
    category: "Input",
    created: "2024-01-12",
    stars: 156,
    views: 670,
    status: "draft",
  },
  {
    id: "5",
    name: "Command Palette",
    category: "Navigation",
    created: "2024-01-11",
    stars: 423,
    views: 2100,
    status: "published",
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
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { id: "published", label: "Published", count: 45 },
      { id: "draft", label: "Draft", count: 8 },
      { id: "archived", label: "Archived", count: 3 },
    ],
  },
]

export default function ManageComponentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const filteredComponents = components.filter((component) =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredComponents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedComponents = filteredComponents.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Container>
      <div className="py-8">
        <PageTitle title="Manage Components" subtitle="View and manage all components in the registry">
          <Button asChild>
            <Link href="/admin/components/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Link>
          </Button>
        </PageTitle>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <SearchBar placeholder="Search components..." onSearch={setSearchQuery} />
          </div>
          <FilterPanel
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Stars</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedComponents.map((component) => (
                <TableRow key={component.id}>
                  <TableCell className="font-medium">
                    <Link href={`/components/${component.id}`} className="hover:underline">
                      {component.name}
                    </Link>
                  </TableCell>
                  <TableCell>{component.category}</TableCell>
                  <TableCell>{component.created}</TableCell>
                  <TableCell>{component.stars}</TableCell>
                  <TableCell>{component.views.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(component.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/components/${component.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/components/${component.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/components/${component.id}/analytics`}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
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
          </div>
        )}
      </div>
    </Container>
  )
}
