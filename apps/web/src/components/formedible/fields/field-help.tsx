"use client";
import { ExternalLink, HelpCircle, Info } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FieldHelpProps {
	help?: {
		text?: string;
		tooltip?: string;
		position?: "top" | "bottom" | "left" | "right";
		link?: { url: string; text: string };
	};
	className?: string;
}

export const FieldHelp: React.FC<FieldHelpProps> = ({ help, className }) => {
	const [showTooltip, setShowTooltip] = useState(false);

	if (!help || (!help.text && !help.tooltip && !help.link)) {
		return null;
	}

	const { text, tooltip, position = "top", link } = help;

	return (
		<div className={cn("space-y-2", className)}>
			{/* Help text */}
			{text && (
				<div className="flex items-start gap-2 text-muted-foreground text-xs">
					<Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
					<p>{text}</p>
				</div>
			)}

			{/* Tooltip trigger */}
			{tooltip && (
				<div className="relative inline-block">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
						onMouseEnter={() => setShowTooltip(true)}
						onMouseLeave={() => setShowTooltip(false)}
						onFocus={() => setShowTooltip(true)}
						onBlur={() => setShowTooltip(false)}
					>
						<HelpCircle className="h-3 w-3" />
					</Button>

					{/* Tooltip */}
					{showTooltip && (
						<div
							className={cn(
								"absolute z-50 whitespace-nowrap rounded bg-black px-2 py-1 text-white text-xs shadow-lg",
								"pointer-events-none",
								{
									"-translate-x-1/2 bottom-full left-1/2 mb-1":
										position === "top",
									"-translate-x-1/2 top-full left-1/2 mt-1":
										position === "bottom",
									"-translate-y-1/2 top-1/2 right-full mr-1":
										position === "left",
									"-translate-y-1/2 top-1/2 left-full ml-1":
										position === "right",
								},
							)}
						>
							{tooltip}
							{/* Tooltip arrow */}
							<div
								className={cn("absolute h-0 w-0 border-2 border-transparent", {
									"-translate-x-1/2 top-full left-1/2 border-t-black border-b-0":
										position === "top",
									"-translate-x-1/2 bottom-full left-1/2 border-t-0 border-b-black":
										position === "bottom",
									"-translate-y-1/2 top-1/2 left-full border-r-0 border-l-black":
										position === "left",
									"-translate-y-1/2 top-1/2 right-full border-r-black border-l-0":
										position === "right",
								})}
							/>
						</div>
					)}
				</div>
			)}

			{/* Help link */}
			{link && (
				<div className="flex items-center gap-1">
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto p-0 text-primary text-xs hover:text-primary/80"
						onClick={() =>
							window.open(link.url, "_blank", "noopener,noreferrer")
						}
					>
						{link.text}
						<ExternalLink className="ml-1 h-3 w-3" />
					</Button>
				</div>
			)}
		</div>
	);
};
