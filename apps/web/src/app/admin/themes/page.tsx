"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageTitle } from "@/components/layout/page-title"
import { ThemePreview } from "@/components/theme/theme-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Edit, Trash2, Copy } from "lucide-react"

// Mock theme data
const themes = [
  {
    id: "1",
    name: "Default",
    description: "The default shadcn/ui theme",
    colors: {
      primary: "#0f172a",
      secondary: "#f1f5f9",
      accent: "#e2e8f0",
      background: "#ffffff",
    },
    isDefault: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Dark",
    description: "Dark theme variant",
    colors: {
      primary: "#f8fafc",
      secondary: "#1e293b",
      accent: "#334155",
      background: "#0f172a",
    },
    isDefault: false,
    createdAt: "2024-01-02",
  },
  {
    id: "3",
    name: "Blue",
    description: "Blue accent theme",
    colors: {
      primary: "#3b82f6",
      secondary: "#eff6ff",
      accent: "#dbeafe",
      background: "#ffffff",
    },
    isDefault: false,
    createdAt: "2024-01-03",
  },
  {
    id: "4",
    name: "Green",
    description: "Nature-inspired green theme",
    colors: {
      primary: "#059669",
      secondary: "#ecfdf5",
      accent: "#d1fae5",
      background: "#ffffff",
    },
    isDefault: false,
    createdAt: "2024-01-04",
  },
]

export default function ManageThemesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTheme, setNewTheme] = useState({
    name: "",
    description: "",
    colors: {
      primary: "#0f172a",
      secondary: "#f1f5f9",
      accent: "#e2e8f0",
      background: "#ffffff",
    },
  })

  const handleCreateTheme = () => {
    // In real app, would make API call
    console.log("Creating theme:", newTheme)
    setIsCreateDialogOpen(false)
    setNewTheme({
      name: "",
      description: "",
      colors: {
        primary: "#0f172a",
        secondary: "#f1f5f9",
        accent: "#e2e8f0",
        background: "#ffffff",
      },
    })
  }

  const handleColorChange = (colorKey: string, value: string) => {
    setNewTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
  }

  return (
    <Container>
      <div className="py-8">
        <PageTitle title="Manage Themes" subtitle="Create and manage theme configurations">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Theme</DialogTitle>
                <DialogDescription>Create a new theme configuration for the registry.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="theme-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="theme-name"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme((prev) => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="theme-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="theme-description"
                    value={newTheme.description}
                    onChange={(e) => setNewTheme((prev) => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={newTheme.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={newTheme.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={newTheme.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={newTheme.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={newTheme.colors.accent}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={newTheme.colors.accent}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={newTheme.colors.background}
                        onChange={(e) => handleColorChange("background", e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={newTheme.colors.background}
                        onChange={(e) => handleColorChange("background", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2">
                    <ThemePreview name={newTheme.name || "New Theme"} colors={newTheme.colors} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTheme}>Create Theme</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card key={theme.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {theme.name}
                      {theme.isDefault && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Default</span>
                      )}
                    </CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!theme.isDefault && (
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <ThemePreview name={theme.name} colors={theme.colors} />
                <div className="mt-4 text-sm text-muted-foreground">Created: {theme.createdAt}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  )
}
