# Theme Implementation Plan

This document outlines the plan to implement theme switching functionality in the application, based on the analysis of the `tweakcn-reference` project.

## Analysis of Theme Switching in `tweakcn-reference`

Here is a breakdown of how the theme switching works, based on the files I've read:

**1. State Management:**

- **`store/editor-store.ts`**: This is the central piece of state management. It uses `zustand` to create a store that holds the `themeState`. This `themeState` contains the current theme's styles (`light` and `dark`), the current mode (`light` or `dark`), the selected preset, and some other editor-related properties.
- **`store/theme-preset-store.ts`**: This store manages the available theme presets. It loads the default presets from `utils/theme-presets.ts` and can also load saved presets from the server.

**2. Theme Definition:**

- **`config/theme.ts`**: This file defines the default theme styles for both light and dark modes (`defaultLightThemeStyles` and `defaultDarkThemeStyles`). It also defines the `defaultThemeState` which is the initial state for the `editor-store`.
- **`utils/theme-presets.ts`**: This file contains a large object (`defaultPresets`) that defines all the available theme presets. Each preset has a `label` and a `styles` object with `light` and `dark` properties.

**3. Applying the Theme:**

- **`components/theme-provider.tsx`**: This is a React context provider that wraps the entire application.
  - It gets the `themeState` from the `editor-store`.
  - It has a `useEffect` hook that calls `applyThemeToElement` whenever the `themeState` changes.
  - It provides a `useTheme` hook for child components to access the current theme and functions to change it.
- **`utils/apply-theme.ts`**: This file contains the `applyThemeToElement` function. This function takes the `themeState` and the root HTML element as input. It then:
  - Adds or removes the `dark` class to the root element based on the current mode.
  - Applies the common styles (like border-radius) to the root element.
  - Applies the mode-specific colors to the root element as CSS variables.
- **`components/theme-script.tsx`**: This component renders a `<script>` tag in the `<head>` of the document. This script runs before the React application hydrates. It reads the theme from local storage and applies the initial theme to the `documentElement` to prevent flickering.

**4. User Interaction:**

- **`components/theme-toggle.tsx`**: This is a simple button that uses the `useTheme` hook to toggle between light and dark mode. It calls the `toggleTheme` function from the `ThemeProvider`.
- **`components/home/theme-preset-selector.tsx`**: This component displays the theme presets.
  - It gets the available presets from `utils/theme-presets.ts`.
  - It uses the `ThemePresetButtons` component to render the buttons for each preset.
- **`components/home/theme-preset-buttons.tsx`**: This component renders the buttons for the theme presets. When a button is clicked, it calls the `applyThemePreset` function from the `editor-store`.
- **`hooks/use-theme-preset-from-url.ts`**: This hook checks if there is a `theme` query parameter in the URL. If there is, it applies the corresponding theme preset.

---

## Amended Implementation Plan

### Phase 1: Core Infrastructure & Data Fetching

1.  **Create `apps/web/src/lib/registry.ts`:**

    - This file will be responsible for fetching the theme registry from the official GitHub repository (`https://github.com/tweakit/tweak-cn-registry/blob/main/themes.json`).
    - It will contain a function, `getRegistryThemes`, that fetches and parses the `themes.json` file.
    - This function will be called at build time to ensure the themes are always up-to-date without a client-side performance penalty.

2.  **Create `apps/web/src/lib/themes.ts`:**

    - This file will define the `Theme` and `ThemeProperties` TypeScript types based on the structure of the objects in the fetched `themes.json`.
    - It will import the `getRegistryThemes` function and call it to populate a `themes` array. This array will be made available to the rest of the application.

3.  **Create `apps/web/src/lib/apply-theme.ts`:**

    - This file will contain the `applyTheme` function, which will take a theme object and a mode (`light` or `dark`) and apply the corresponding CSS variables to the `documentElement`. This remains the same as the previous plan.

4.  **Create `apps/web/src/components/theme-provider.tsx`:**

    - This will be a React context provider that manages the theme state.
    - It will import the `themes` array from `apps/web/src/lib/themes.ts`.
    - It will use `useState` to store the _name_ of the current theme and the current mode (`light`/`dark`).
    - It will have a `useEffect` hook that finds the full theme object from the `themes` array and calls `applyTheme` whenever the theme name or mode changes.
    - It will provide a `useTheme` hook for child components.

5.  **Create `apps/web/src/components/theme-script.tsx`:**

    - This component will render a `<script>` tag that sets the initial theme from `localStorage` to prevent FOUC (Flash of Unstyled Content). This remains the same.

6.  **Update `apps/web/src/app/layout.tsx`:**

    - Wrap the `body` with the `ThemeProvider`.
    - Add the `ThemeScript` component to the `head`.

7.  **Update `apps/web/src/app/globals.css`:**
    - Add the CSS variables for the theme properties, identical to `tweakcn-reference/app/globals.css`.

### Phase 2: UI Components

1.  **Create `apps/web/src/components/theme-toggle.tsx`:**

    - A button that uses the `useTheme` hook to toggle between light and dark mode.

2.  **Create `apps/web/src/components/theme-selector.tsx`:**

    - This component will display a list of available themes fetched from the registry.
    - It will use the `useTheme` hook to get the current theme name and the `setTheme` function to change it.

3.  **Update menu:**
    - Add the `ThemeToggle` and `ThemeSelector` components to the menu.
