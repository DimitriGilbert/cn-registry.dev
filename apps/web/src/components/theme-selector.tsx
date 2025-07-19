"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { applyRegistryTheme } from "@/lib/apply-theme";
import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

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
	const { themeState } = useTheme();
	const [availableThemes, setAvailableThemes] = useState<ThemeItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadThemes();
	}, []);

	useEffect(() => {
		const currentPreset = localStorage.getItem("theme-preset");
		if (currentPreset && currentPreset !== "default" && availableThemes.length > 0) {
			const theme = availableThemes.find(t => t.name === currentPreset);
			if (theme?.cssVars) {
				applyRegistryTheme(theme, themeState.currentMode);
			}
		}
	}, [themeState.currentMode, availableThemes]);

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
					cssVars: item.cssVars
				}));

			setAvailableThemes([
				{ name: "default", title: "Default", type: "built-in" },
				...themes
			]);
		} catch (error) {
			console.error("Failed to load themes:", error);
		} finally {
			setLoading(false);
		}
	};

	const applyThemePreset = (themeName: string) => {
		if (themeName === "default") {
			localStorage.removeItem("theme-preset");
			location.reload();
			return;
		}
		
		const theme = availableThemes.find(t => t.name === themeName);
		
		if (theme?.cssVars) {
			applyRegistryTheme(theme, themeState.currentMode);
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
			<DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto w-48">
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