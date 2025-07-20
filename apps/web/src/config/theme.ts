export const COMMON_STYLES = [
	"font-sans",
	"font-serif",
	"font-mono",
	"radius",
	"shadow-opacity",
	"shadow-blur",
	"shadow-spread",
	"shadow-offset-x",
	"shadow-offset-y",
	"letter-spacing",
	"spacing",
];

export const DEFAULT_FONT_SANS =
	"ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

export const DEFAULT_FONT_SERIF =
	'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

export const DEFAULT_FONT_MONO =
	'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Default light theme styles (using existing CSS variable values)
export const defaultLightThemeStyles = {
	background: "0 0% 100%",
	foreground: "222.2 84% 4.9%",
	card: "0 0% 100%",
	"card-foreground": "222.2 84% 4.9%",
	popover: "0 0% 100%",
	"popover-foreground": "222.2 84% 4.9%",
	primary: "222.2 47.4% 11.2%",
	"primary-foreground": "210 40% 98%",
	secondary: "210 40% 96%",
	"secondary-foreground": "222.2 47.4% 11.2%",
	muted: "210 40% 96%",
	"muted-foreground": "215.4 16.3% 46.9%",
	accent: "210 40% 96%",
	"accent-foreground": "222.2 47.4% 11.2%",
	destructive: "0 84.2% 60.2%",
	"destructive-foreground": "210 40% 98%",
	border: "214.3 31.8% 91.4%",
	input: "214.3 31.8% 91.4%",
	ring: "222.2 84% 4.9%",
	"chart-1": "12 76% 61%",
	"chart-2": "173 58% 39%",
	"chart-3": "197 37% 24%",
	"chart-4": "43 74% 66%",
	"chart-5": "27 87% 67%",
	radius: "0.5rem",
	"font-sans": DEFAULT_FONT_SANS,
	"font-serif": DEFAULT_FONT_SERIF,
	"font-mono": DEFAULT_FONT_MONO,
	shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
	"shadow-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
	"shadow-2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
	"shadow-lg":
		"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
	"shadow-md":
		"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
	"shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
	"shadow-xl":
		"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
	"shadow-xs": "0 0 0 1px rgba(0, 0, 0, 0.05)",
	"shadow-color": "0 0% 0%",
	"shadow-opacity": "0.1",
	"shadow-blur": "3px",
	"shadow-spread": "0px",
	"shadow-offset-x": "0",
	"shadow-offset-y": "1px",
	"letter-spacing": "0em",
	spacing: "0.25rem",
	sidebar: "210 40% 96%",
	"sidebar-accent": "222.2 47.4% 11.2%",
	"sidebar-accent-foreground": "210 40% 98%",
	"sidebar-border": "214.3 31.8% 91.4%",
	"sidebar-foreground": "222.2 84% 4.9%",
	"sidebar-primary": "222.2 47.4% 11.2%",
	"sidebar-primary-foreground": "210 40% 98%",
	"sidebar-ring": "222.2 84% 4.9%",
	"tracking-normal": "0em",
	"tracking-tight": "-0.025em",
	"tracking-tighter": "-0.05em",
	"tracking-wide": "0.025em",
	"tracking-wider": "0.05em",
	"tracking-widest": "0.1em",
};

// Default dark theme styles
export const defaultDarkThemeStyles = {
	...defaultLightThemeStyles,
	background: "222.2 84% 4.9%",
	foreground: "210 40% 98%",
	card: "222.2 84% 4.9%",
	"card-foreground": "210 40% 98%",
	popover: "222.2 84% 4.9%",
	"popover-foreground": "210 40% 98%",
	primary: "210 40% 98%",
	"primary-foreground": "222.2 47.4% 11.2%",
	secondary: "217.2 32.6% 17.5%",
	"secondary-foreground": "210 40% 98%",
	muted: "217.2 32.6% 17.5%",
	"muted-foreground": "215 20.2% 65.1%",
	accent: "217.2 32.6% 17.5%",
	"accent-foreground": "210 40% 98%",
	destructive: "0 62.8% 30.6%",
	"destructive-foreground": "210 40% 98%",
	border: "217.2 32.6% 17.5%",
	input: "217.2 32.6% 17.5%",
	ring: "212.7 26.8% 83.9%",
	"chart-1": "220 70% 50%",
	"chart-2": "160 60% 45%",
	"chart-3": "30 80% 55%",
	"chart-4": "280 65% 60%",
	"chart-5": "340 75% 55%",
	"shadow-color": "0 0% 0%",
	"letter-spacing": "0em",
	spacing: "0.25rem",
};

export const defaultThemeStyles = {
	light: defaultLightThemeStyles,
	dark: defaultDarkThemeStyles,
};

export const defaultThemeState = {
	styles: defaultThemeStyles,
	currentMode: "light" as const,
};
