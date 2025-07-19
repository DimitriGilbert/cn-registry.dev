"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { applyRegistryTheme } from "@/lib/apply-theme";

interface ThemeItem {
	name: string;
	title: string;
	cssVars?: {
		light?: Record<string, string>;
		dark?: Record<string, string>;
	};
}

export function ThemeButtons() {
	const { themeState } = useTheme();
	const [availableThemes, setAvailableThemes] = useState<ThemeItem[]>([]);
	const [currentTheme, setCurrentTheme] = useState<string>("default");

	useEffect(() => {
		loadThemes();
		const stored = localStorage.getItem("theme-preset");
		if (stored) setCurrentTheme(stored);
	}, []);

	const loadThemes = async () => {
		try {
			const response = await fetch("/tweakcn-registry.json");
			const registry = await response.json();
			
			const themes = registry.items
				.filter((item: any) => item.type === "registry:style" && item.cssVars)
				.slice(0, 6) // Show first 6 themes
				.map((item: any) => ({
					name: item.name,
					title: item.title || item.name,
					cssVars: item.cssVars
				}));

			setAvailableThemes(themes);
		} catch (error) {
			console.error("Failed to load themes:", error);
		}
	};

	const handleThemeClick = (themeName: string) => {
		const theme = availableThemes.find(t => t.name === themeName);
		if (theme?.cssVars) {
			applyRegistryTheme(theme, themeState.currentMode);
			setCurrentTheme(themeName);
			localStorage.setItem("theme-preset", themeName);
		}
	};

	return (
		<div className="flex flex-wrap gap-3 justify-center">
			{availableThemes.map((theme) => {
				const isSelected = currentTheme === theme.name;
				
				return (
					<Button
						key={theme.name}
						variant={isSelected ? "default" : "outline"}
						size="sm"
						onClick={() => handleThemeClick(theme.name)}
						className="capitalize"
					>
						{theme.title.replace(/-/g, " ")}
					</Button>
				);
			})}
		</div>
	);
}