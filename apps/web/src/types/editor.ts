import type { ThemeStyles } from "./theme";

export interface ThemeEditorState {
	preset?: string;
	styles: ThemeStyles;
	currentMode: "light" | "dark";
	hslAdjustments?: {
		hueShift: number;
		saturationScale: number;
		lightnessScale: number;
	};
}
