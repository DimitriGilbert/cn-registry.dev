import type React from "react"
interface PageTitleProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageTitle({ title, subtitle, children }: PageTitleProps) {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {children}
      </div>
      {subtitle && <h2 className="text-lg text-muted-foreground">{subtitle}</h2>}
    </div>
  )
}
