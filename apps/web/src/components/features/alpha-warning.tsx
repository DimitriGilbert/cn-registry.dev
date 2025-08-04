"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlphaWarning() {
	return (
		<div
			className="mb-8 rounded-lg border border-border bg-muted/50 p-4"
			role="alert"
			aria-labelledby="alpha-warning-title"
		>
			<div className="flex items-center gap-3">
				<AlertTriangle
					className="h-5 w-5 text-muted-foreground"
					aria-hidden="true"
				/>
				<div className="flex-1">
					<h3 id="alpha-warning-title" className="font-medium text-foreground">
						Alpha Version
					</h3>
					<p className="mt-1 text-muted-foreground text-sm">
						This is an alpha version. You might encounter bugs and missing
						features. Please help us improve by reporting issues!
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						window.open(
							"https://github.com/DimitriGilbert/cn-registry.dev/issues",
							"_blank",
							"noopener,noreferrer",
						)
					}
				>
					Report Issue
				</Button>
			</div>
		</div>
	);
}
