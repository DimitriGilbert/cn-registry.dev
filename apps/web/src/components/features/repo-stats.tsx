import { AlertCircle, Eye, GitFork, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RepoStatsProps {
	stars: number;
	forks: number;
	issues: number;
	githubStars: number;
}

export function RepoStats({
	stars,
	forks,
	issues,
	githubStars,
}: RepoStatsProps) {
	const stats = [
		{ label: "Stars", value: stars, icon: Star },
		{ label: "Forks", value: forks, icon: GitFork },
		{ label: "GitHub Stars", value: githubStars, icon: Star },
		{ label: "Issues", value: issues, icon: AlertCircle },
	];

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<Card key={stat.label}>
						<CardContent className="p-4">
							<div className="flex items-center space-x-2">
								<Icon className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="font-medium text-sm">
										{stat.value.toLocaleString()}
									</p>
									<p className="text-muted-foreground text-xs">{stat.label}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
