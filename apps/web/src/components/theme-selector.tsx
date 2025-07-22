"use client";

import { Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeItem {
	name: string;
	title: string;
	type: string;
	cssVars?: {
		light?: Record<string, string>;
		dark?: Record<string, string>;
	};
}

export function ThemeSelector() {
	const { themeState, setThemePreset } = useTheme();
	const [availableThemes, setAvailableThemes] = useState<ThemeItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadThemes();
	}, []);


	const loadThemes = async () => {
		try {
			const response = await fetch("/tweakcn-registry.json");
			const registry = await response.json();

			const themes = registry.items
				.filter((item: any) => item.type === "registry:style" && item.cssVars)
				.map((item: any) => ({
					name: item.name,
					title: item.title || item.name,
					type: item.type,
					cssVars: item.cssVars,
				}));

			setAvailableThemes([
				{ name: "default", title: "Default", type: "built-in" },
				...themes,
			]);
		} catch (error) {
			console.error("Failed to load themes:", error);
		} finally {
			setLoading(false);
		}
	};

	const applyThemePreset = (themeName: string) => {
		if (themeName === "default") {
			// Reset to default theme
			localStorage.removeItem("theme-preset");
			
			// Apply default theme styles from globals.css
			const root = document.documentElement;
			root.classList.remove("light", "dark");
			root.classList.add(themeState.currentMode);
			
			// Remove any custom CSS variables and let defaults from CSS take over
			const customProps = [
				"--background", "--foreground", "--card", "--card-foreground", 
				"--popover", "--popover-foreground", "--primary", "--primary-foreground",
				"--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
				"--accent", "--accent-foreground", "--destructive", "--destructive-foreground",
				"--border", "--input", "--ring", "--radius"
			];
			
			customProps.forEach(prop => root.style.removeProperty(prop));
			
			// Update theme state to default
			setThemePreset({ name: "default" });
			return;
		}

		const theme = availableThemes.find((t) => t.name === themeName);

		if (theme?.cssVars) {
			// Update theme state through provider
			setThemePreset({ name: themeName });
			localStorage.setItem("theme-preset", themeName);
		}
	};

	if (loading) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<Palette className="h-4 w-4" />
					<span className="sr-only">Select theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="max-h-[300px] w-48 overflow-y-auto"
			>
				{availableThemes.map((theme) => (
					<DropdownMenuItem
						key={theme.name}
						onClick={() => applyThemePreset(theme.name)}
						className="cursor-pointer"
					>
						{theme.title}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
