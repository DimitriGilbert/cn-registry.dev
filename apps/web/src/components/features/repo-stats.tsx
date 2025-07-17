import { Star, GitFork, AlertCircle, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface RepoStatsProps {
  stars: number
  forks: number
  issues: number
  watchers: number
}

export function RepoStats({ stars, forks, issues, watchers }: RepoStatsProps) {
  const stats = [
    { label: "Stars", value: stars, icon: Star },
    { label: "Forks", value: forks, icon: GitFork },
    { label: "Issues", value: issues, icon: AlertCircle },
    { label: "Watchers", value: watchers, icon: Eye },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
