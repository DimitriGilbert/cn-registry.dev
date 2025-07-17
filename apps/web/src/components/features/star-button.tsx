"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StarButtonProps {
  isStarred?: boolean
  onToggle?: () => void
  size?: "sm" | "default" | "lg"
}

export function StarButton({ isStarred = false, onToggle, size = "sm" }: StarButtonProps) {
  return (
    <Button variant="ghost" size={size} onClick={onToggle} className={cn("p-1", isStarred && "text-yellow-500")}>
      <Star className={cn("h-4 w-4", isStarred && "fill-current")} />
    </Button>
  )
}
