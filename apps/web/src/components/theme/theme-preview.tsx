import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ThemePreviewProps {
	name: string;
	colors: {
		primary: string;
		secondary: string;
		accent: string;
		background: string;
	};
}

export function ThemePreview({ name, colors }: ThemePreviewProps) {
	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-sm">{name}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-2">
					<div className="space-y-2">
						<div
							className="h-8 rounded border"
							style={{ backgroundColor: colors.primary }}
						/>
						<p className="text-muted-foreground text-xs">Primary</p>
					</div>
					<div className="space-y-2">
						<div
							className="h-8 rounded border"
							style={{ backgroundColor: colors.secondary }}
						/>
						<p className="text-muted-foreground text-xs">Secondary</p>
					</div>
					<div className="space-y-2">
						<div
							className="h-8 rounded border"
							style={{ backgroundColor: colors.accent }}
						/>
						<p className="text-muted-foreground text-xs">Accent</p>
					</div>
					<div className="space-y-2">
						<div
							className="h-8 rounded border"
							style={{ backgroundColor: colors.background }}
						/>
						<p className="text-muted-foreground text-xs">Background</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
