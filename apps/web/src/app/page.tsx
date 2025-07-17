import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { SearchBar } from "@/components/features/search-bar"
import { Carousel } from "@/components/ui/carousel"
import { ComponentCard } from "@/components/features/component-card"
import { ToolCard } from "@/components/features/tool-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

// Mock data
const latestComponents = [
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
]

const trendingComponents = [
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
  {
    id: "7",
    name: "Calendar Component",
    description: "Full-featured calendar with event management",
    category: "Date & Time",
    stars: 289,
    downloads: 1300,
    githubUrl: "https://github.com/example/calendar",
  },
]

const featuredTools = [
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
  },
  {
    id: "3",
    name: "Component Analyzer",
    description: "Analyze and optimize your shadcn/ui component usage",
    category: "Analysis",
    stars: 234,
    downloads: 890,
    githubUrl: "https://github.com/example/analyzer",
  },
]

export default function HomePage() {
  return (
    <Container>
      <div className="py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <PageTitle title="cn-registry" subtitle="Discover and share shadcn/ui components and developer tools" />
          <div className="max-w-md mx-auto">
            <SearchBar
              placeholder="Search components and tools..."
              suggestions={["data table", "form", "chart", "calendar", "cli"]}
            />
          </div>
        </div>

        {/* Latest Components */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Latest Components</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/components" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Carousel>
            {latestComponents.map((component) => (
              <div key={component.id} className="min-w-[300px]">
                <ComponentCard {...component} />
              </div>
            ))}
          </Carousel>
        </section>

        {/* Trending Components */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Trending Components</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/components?sort=trending" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Carousel>
            {trendingComponents.map((component) => (
              <div key={component.id} className="min-w-[300px]">
                <ComponentCard {...component} />
              </div>
            ))}
          </Carousel>
        </section>

        {/* Featured Tools */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Featured Tools</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/tools" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </section>
      </div>
    </Container>
  )
}
