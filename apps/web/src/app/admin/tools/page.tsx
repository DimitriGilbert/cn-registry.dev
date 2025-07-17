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
const tools = [
  {
    id: "1",
    name: "shadcn/ui CLI",
    category: "CLI Tools",
    created: "2024-01-15",
    stars: 1200,
    downloads: 5000,
    status: "published",
  },
  {
    id: "2",
    name: "Tailwind Config Generator",
    category: "Configuration",
    created: "2024-01-14",
    stars: 456,
    downloads: 2300,
    status: "published",
  },
  {
    id: "3",
    name: "Component Analyzer",
    category: "Analysis",
    created: "2024-01-13",
    stars: 234,
    downloads: 890,
    status: "draft",
  },
  {
    id: "4",
    name: "Theme Builder",
    category: "Design Tools",
    created: "2024-01-12",
    stars: 567,
    downloads: 1800,
    status: "published",
  },
  {
    id: "5",
    name: "VS Code Extension",
    category: "Editor Extensions",
    created: "2024-01-11",
    stars: 789,
    downloads: 3400,
    status: "published",
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
      { id: "editor-extensions", label: "Editor Extensions", count: 4 },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { id: "published", label: "Published", count: 25 },
      { id: "draft", label: "Draft", count: 5 },
      { id: "archived", label: "Archived", count: 2 },
    ],
  },
]

export default function ManageToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const filteredTools = tools.filter((tool) => tool.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredTools.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTools = filteredTools.slice(startIndex, startIndex + itemsPerPage)

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
        <PageTitle title="Manage Tools" subtitle="View and manage all developer tools in the registry">
          <Button asChild>
            <Link href="/admin/tools/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Link>
          </Button>
        </PageTitle>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <SearchBar placeholder="Search tools..." onSearch={setSearchQuery} />
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
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">
                    <Link href={`/tools/${tool.id}`} className="hover:underline">
                      {tool.name}
                    </Link>
                  </TableCell>
                  <TableCell>{tool.category}</TableCell>
                  <TableCell>{tool.created}</TableCell>
                  <TableCell>{tool.stars}</TableCell>
                  <TableCell>{tool.downloads?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(tool.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tools/${tool.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tools/${tool.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tools/${tool.id}/analytics`}>
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
