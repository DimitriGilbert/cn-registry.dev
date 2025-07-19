export type ThemeStyleProps = {
	accent: string;
	"accent-foreground": string;
	background: string;
	border: string;
	card: string;
	"card-foreground": string;
	"chart-1": string;
	"chart-2": string;
	"chart-3": string;
	"chart-4": string;
	"chart-5": string;
	destructive: string;
	"destructive-foreground": string;
	"font-mono": string;
	"font-sans": string;
	"font-serif": string;
	foreground: string;
	input: string;
	"letter-spacing": string;
	muted: string;
	"muted-foreground": string;
	popover: string;
	"popover-foreground": string;
	primary: string;
	"primary-foreground": string;
	radius: string;
	ring: string;
	secondary: string;
	"secondary-foreground": string;
	shadow: string;
	"shadow-2xl": string;
	"shadow-2xs": string;
	"shadow-blur": string;
	"shadow-color": string;
	"shadow-lg": string;
	"shadow-md": string;
	"shadow-offset-x": string;
	"shadow-offset-y": string;
	"shadow-opacity": string;
	"shadow-sm": string;
	"shadow-spread": string;
	"shadow-xl": string;
	"shadow-xs": string;
	sidebar: string;
	"sidebar-accent": string;
	"sidebar-accent-foreground": string;
	"sidebar-border": string;
	"sidebar-foreground": string;
	"sidebar-primary": string;
	"sidebar-primary-foreground": string;
	"sidebar-ring": string;
	spacing: string;
	"tracking-normal": string;
	"tracking-tight": string;
	"tracking-tighter": string;
	"tracking-wide": string;
	"tracking-wider": string;
	"tracking-widest": string;
};

export type ThemeStyles = {
	light: ThemeStyleProps;
	dark: ThemeStyleProps;
};

export interface ThemeState {
	styles: ThemeStyles;
	currentMode: "light" | "dark";
	selectedPreset?: string;
}

export interface ThemePreset {
	name: string;
	label: string;
	styles: ThemeStyles;
}

export type ThemeMode = "light" | "dark";
