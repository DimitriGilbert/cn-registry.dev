import type { ThemePreset } from "@/types/theme";

// Load themes from the registry
export async function loadThemePresets(): Promise<Record<string, ThemePreset>> {
	try {
		const response = await fetch("/tweakcn-registry.json");
		const registry = await response.json();
		
		const presets: Record<string, ThemePreset> = {};
		
		registry.items
			.filter((item: any) => item.type === "registry:style" && item.cssVars)
			.forEach((item: any) => {
				presets[item.name] = {
					name: item.name,
					label: item.title || item.name,
					styles: {
						light: item.cssVars.light || {},
						dark: item.cssVars.dark || {},
					},
				};
			});
		
		return presets;
	} catch (error) {
		console.error("Failed to load theme presets:", error);
		return {};
	}
}

export function applyThemePreset(presetName: string, presets: Record<string, ThemePreset>) {
	const preset = presets[presetName];
	if (!preset) return;

	const root = document.documentElement;
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const mode = prefersDark ? "dark" : "light";
	
	const styles = preset.styles[mode];
	
	// Apply all styles to CSS custom properties
	Object.entries(styles).forEach(([key, value]) => {
		if (typeof value === "string") {
			root.style.setProperty(`--${key}`, value);
		}
	});
	
	// Store current theme in localStorage
	localStorage.setItem("current-theme", presetName);
}