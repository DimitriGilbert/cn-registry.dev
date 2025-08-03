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
					<h1 className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text font-bold text-4xl text-transparent tracking-tight md:text-5xl">
						{title}
					</h1>
					{/* Decorative underline */}
					<div className="h-1 w-20 rounded-full bg-gradient-to-r from-primary via-secondary to-primary/50" />
				</div>
				{children}
			</div>
			{subtitle && (
				<h2 className="max-w-2xl font-light text-muted-foreground text-xl leading-relaxed md:text-2xl">
					{subtitle}
				</h2>
			)}
		</div>
	);
}
