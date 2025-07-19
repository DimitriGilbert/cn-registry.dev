"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
	const { themeState, toggleTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label="Toggle theme"
		>
			{themeState.currentMode === "light" ? (
				<SunIcon className="h-[1.2rem] w-[1.2rem]" />
			) : (
				<MoonIcon className="h-[1.2rem] w-[1.2rem]" />
			)}
		</Button>
	);
}