"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { SearchBar } from "@/components/features/search-bar"
import { FilterPanel } from "@/components/features/filter-panel"
import { ComponentCard } from "@/components/features/component-card"
import { ToolCard } from "@/components/features/tool-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock search results
const searchResults = {
  components: [
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
  ],
  tools: [
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
      name: "Theme Builder",
      description: "Visual theme builder for shadcn/ui components",
      category: "Design Tools",
      stars: 567,
      downloads: 1800,
      githubUrl: "https://github.com/example/theme-builder",
    },
  ],
}

const filterGroups = [
  {
    id: "category",
    label: "Category",
    options: [
      { id: "tables", label: "Tables", count: 5 },
      { id: "forms", label: "Forms", count: 3 },
      { id: "cli-tools", label: "CLI Tools", count: 2 },
      { id: "design-tools", label: "Design Tools", count: 4 },
    ],
  },
  {
    id: "type",
    label: "Type",
    options: [
      { id: "component", label: "Component", count: 8 },
      { id: "tool", label: "Tool", count: 6 },
    ],
  },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("components")

  const filteredComponents = searchResults.components.filter(
    (component) =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredTools = searchResults.tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalResults = filteredComponents.length + filteredTools.length

  return (
    <Container>
      <div className="py-8">
        <PageTitle title="Search" subtitle="Find components and tools for your projects" />

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <SearchBar
              placeholder="Search components and tools..."
              onSearch={setSearchQuery}
              suggestions={["data table", "form", "cli", "theme"]}
            />
          </div>
          <FilterPanel
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />
        </div>

        {searchQuery && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Found {totalResults} results for</span>
              <Badge variant="outline">"{searchQuery}"</Badge>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="components" className="flex items-center gap-2">
              Components
              <Badge variant="secondary" className="text-xs">
                {filteredComponents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              Tools
              <Badge variant="secondary" className="text-xs">
                {filteredTools.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComponents.map((component) => (
                <ComponentCard key={component.id} {...component} />
              ))}
            </div>
            {filteredComponents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No components found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tools found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  )
}
