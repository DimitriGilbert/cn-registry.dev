"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { defaultThemeState } from "@/config/theme";
import { applyThemeToElement } from "@/lib/apply-theme";
import type { ThemeMode, ThemePreset, ThemeState } from "@/types/theme";
import { loadThemePresets } from "@/utils/theme-presets";

interface ThemeContextType {
	themeState: ThemeState;
	setTheme: (mode: ThemeMode) => void;
	toggleTheme: () => void;
	setThemePreset: (preset: { name: string; styles?: any }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

interface ThemeProviderProps {
	children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [themeState, setThemeState] = useState<ThemeState>(defaultThemeState);

	useEffect(() => {
		const initTheme = async () => {
			// Get system preference first
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;

			const storedTheme = localStorage.getItem("theme");
			const storedPreset = localStorage.getItem("theme-preset");

			// If there's a stored theme state, use it
			if (storedTheme) {
				try {
					const parsed = JSON.parse(storedTheme);
					setThemeState(parsed);
					return;
				} catch {
					const mode = storedTheme as ThemeMode;
					if (mode === "light" || mode === "dark") {
						setThemeState((prev) => ({ ...prev, currentMode: mode }));
						return;
					}
				}
			}

			// Check if a preset is stored without full theme state
			if (storedPreset && storedPreset !== "default") {
				try {
					const presets = await loadThemePresets();
					const preset = presets[storedPreset];

					if (preset) {
						const newThemeState = {
							styles: preset.styles,
							currentMode: prefersDark ? "dark" : ("light" as ThemeMode),
							selectedPreset: storedPreset,
						};
						setThemeState(newThemeState);
						return;
					}
				} catch (error) {
					console.error(
						`Failed to load stored preset "${storedPreset}":`,
						error,
					);
				}
			}

			// No stored theme - initialize with bubblegum as default
			try {
				const response = await fetch("/tweakcn-registry.json");
				const registry = await response.json();

				const items = Array.isArray(registry.items) ? registry.items : [];
				const bubblegumTheme = items.find(
					(item: any) =>
						item.type === "registry:style" && item.name === "bubblegum",
				);

				if (bubblegumTheme?.cssVars) {
					const newThemeState = {
						styles: defaultThemeState.styles, // Keep fallback styles
						currentMode: prefersDark ? "dark" : ("light" as ThemeMode),
						selectedPreset: "bubblegum",
					};
					setThemeState(newThemeState);
					localStorage.setItem("theme-preset", "bubblegum");
					return;
				}
			} catch (error) {
				console.error("Failed to load bubblegum theme:", error);
			}

			// Final fallback - default theme with system preference
			setThemeState((prev) => ({
				...prev,
				currentMode: prefersDark ? "dark" : "light",
				selectedPreset: "bubblegum",
			}));
		};

		initTheme();
	}, []);

	useEffect(() => {
		const applyCurrentTheme = async () => {
			// Always apply registry theme if selectedPreset is set
			if (
				themeState.selectedPreset &&
				themeState.selectedPreset !== "default"
			) {
				try {
					const response = await fetch("/tweakcn-registry.json");
					const registry = await response.json();

					const items = Array.isArray(registry.items) ? registry.items : [];
					const registryTheme = items.find(
						(item: any) =>
							item.type === "registry:style" &&
							item.name === themeState.selectedPreset,
					);

					if (registryTheme?.cssVars) {
						const root = document.documentElement;
						root.classList.remove("light", "dark");
						root.classList.add(themeState.currentMode);

						const vars =
							registryTheme.cssVars[themeState.currentMode] ||
							registryTheme.cssVars.light;
						if (vars) {
							Object.entries(vars).forEach(([key, value]) => {
								root.style.setProperty(`--${key}`, String(value));
							});
						}

						localStorage.setItem("theme", JSON.stringify(themeState));
						localStorage.setItem("theme-preset", themeState.selectedPreset);
						return;
					}
				} catch (error) {
					console.error("Failed to apply registry theme:", error);
				}
			}

			// Fallback to default theme application
			applyThemeToElement(themeState);
			localStorage.setItem("theme", JSON.stringify(themeState));
		};

		applyCurrentTheme();
	}, [themeState]);

	const setTheme = (mode: ThemeMode) => {
		setThemeState((prev) => ({ ...prev, currentMode: mode }));
	};

	const toggleTheme = () => {
		setTheme(themeState.currentMode === "light" ? "dark" : "light");
	};

	const setThemePreset = (preset: { name: string; styles?: any }) => {
		setThemeState((prev) => ({
			...prev,
			selectedPreset: preset.name,
		}));
	};

	return (
		<ThemeContext.Provider
			value={{
				themeState,
				setTheme,
				toggleTheme,
				setThemePreset,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}
