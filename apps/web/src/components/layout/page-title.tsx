import type React from "react";

interface PageTitleProps {
	title: string;
	subtitle?: string;
	children?: React.ReactNode;
}

export function PageTitle({ title, subtitle, children }: PageTitleProps) {
	return (
		<div className="mb-12 space-y-4">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="font-bold text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
						{title}
					</h1>
					{/* Decorative underline */}
					<div className="h-1 w-20 bg-gradient-to-r from-primary via-secondary to-primary/50 rounded-full" />
				</div>
				{children}
			</div>
			{subtitle && (
				<h2 className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light max-w-2xl">
					{subtitle}
				</h2>
			)}
		</div>
	);
}
