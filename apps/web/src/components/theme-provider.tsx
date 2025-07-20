"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { defaultThemeState } from "@/config/theme";
import { applyThemeToElement } from "@/lib/apply-theme";
import type { ThemeMode, ThemePreset, ThemeState } from "@/types/theme";

interface ThemeContextType {
	themeState: ThemeState;
	setTheme: (mode: ThemeMode) => void;
	toggleTheme: () => void;
	setThemePreset: (preset: ThemePreset) => void;
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
		const storedTheme = localStorage.getItem("theme");
		if (storedTheme) {
			try {
				const parsed = JSON.parse(storedTheme);
				setThemeState(parsed);
			} catch {
				const mode = storedTheme as ThemeMode;
				if (mode === "light" || mode === "dark") {
					setThemeState((prev) => ({ ...prev, currentMode: mode }));
				}
			}
		} else {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			setThemeState((prev) => ({
				...prev,
				currentMode: prefersDark ? "dark" : "light",
			}));
		}
	}, []);

	useEffect(() => {
		// Only apply default theme if no custom theme preset is active
		const currentPreset = localStorage.getItem("theme-preset");
		if (!currentPreset || currentPreset === "default") {
			applyThemeToElement(themeState);
		}
		localStorage.setItem("theme", JSON.stringify(themeState));
	}, [themeState.currentMode, themeState.selectedPreset]);

	const setTheme = (mode: ThemeMode) => {
		setThemeState((prev) => ({ ...prev, currentMode: mode }));
	};

	const toggleTheme = () => {
		setTheme(themeState.currentMode === "light" ? "dark" : "light");
	};

	const setThemePreset = (preset: ThemePreset) => {
		if (preset?.styles) {
			setThemeState((prev) => ({
				...prev,
				styles: preset.styles,
				selectedPreset: preset.name,
			}));
		}
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
