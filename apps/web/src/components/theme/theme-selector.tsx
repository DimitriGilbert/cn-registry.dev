"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeSelector() {
	const { themeState, toggleTheme } = useTheme();

	return (
		<Button variant="ghost" size="icon" onClick={toggleTheme}>
			{themeState.currentMode === "light" ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
