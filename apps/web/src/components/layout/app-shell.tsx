import type React from "react";
import { Footer } from "./footer";
import { Header } from "./header";

interface AppShellProps {
	children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="relative flex min-h-screen flex-col ">
			<Header />
			<main className="flex-1 bg-gradient-to-br from-background via-foreground/25 to-background/80">
				{children}
			</main>
			<Footer />
		</div>
	);
}
