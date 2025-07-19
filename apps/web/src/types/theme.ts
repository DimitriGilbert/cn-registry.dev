export type ThemeStyleProps = {
	background: string;
	foreground: string;
	card: string;
	"card-foreground": string;
	popover: string;
	"popover-foreground": string;
	primary: string;
	"primary-foreground": string;
	secondary: string;
	"secondary-foreground": string;
	muted: string;
	"muted-foreground": string;
	accent: string;
	"accent-foreground": string;
	destructive: string;
	"destructive-foreground": string;
	border: string;
	input: string;
	ring: string;
	"chart-1": string;
	"chart-2": string;
	"chart-3": string;
	"chart-4": string;
	"chart-5": string;
	"font-sans": string;
	"font-serif": string;
	"font-mono": string;
	radius: string;
	"shadow-color": string;
	"shadow-opacity": string;
	"shadow-blur": string;
	"shadow-spread": string;
	"shadow-offset-x": string;
	"shadow-offset-y": string;
	"letter-spacing": string;
	spacing: string;
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
