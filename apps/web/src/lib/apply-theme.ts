import type { ThemeState } from "@/types/theme";

export function applyThemeToElement(themeState: ThemeState, element: HTMLElement = document.documentElement) {
	const { currentMode, styles } = themeState;
	
	// Update theme class
	element.classList.remove("light", "dark");
	element.classList.add(currentMode);
	
	// Apply theme colors - keep original format (OKLCH, HSL, etc.)
	const properties = styles[currentMode];
	Object.entries(properties).forEach(([key, value]) => {
		element.style.setProperty(`--${key}`, String(value));
	});
}

export function applyRegistryTheme(theme: any, mode: "light" | "dark", element: HTMLElement = document.documentElement) {
	if (!theme?.cssVars) return;
	
	element.classList.remove("light", "dark");
	element.classList.add(mode);
	
	const vars = theme.cssVars[mode] || theme.cssVars.light;
	if (vars) {
		Object.entries(vars).forEach(([key, value]) => {
			// Keep original color format - OKLCH, HSL, etc.
			element.style.setProperty(`--${key}`, String(value));
		});
	}
}