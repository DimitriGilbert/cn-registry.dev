"use client";

import { Button } from "@/components/ui/button";

export function ReportIssueButton() {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() =>
				window.open(
					"https://github.com/DimitriGilbert/cn-registry.dev/issues",
					"_blank",
				)
			}
		>
			Report Issue
		</Button>
	);
}
