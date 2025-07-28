"use client";

import {
	Sandpack,
	SandpackCodeEditor,
	type SandpackFiles,
	SandpackLayout,
	SandpackPreview,
	SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

interface CodeSandboxProps {
	files: SandpackFiles;
	template?: "react-ts" | "react" | "vanilla-ts" | "vanilla" | "nextjs";
	customSetup?: {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
	options?: {
		showNavigator?: boolean;
		showTabs?: boolean;
		showLineNumbers?: boolean;
		editorHeight?: number;
		editorWidthPercentage?: number;
		wrapContent?: boolean;
	};
}

export function CodeSandbox({
	files,
	template = "react-ts",
	customSetup,
	options = {},
}: CodeSandboxProps) {
	const { resolvedTheme } = useTheme();

	const {
		showNavigator = false,
		showTabs = true,
		showLineNumbers = true,
		editorHeight = 400,
		editorWidthPercentage = 50,
		wrapContent = true,
	} = options;

	// Define theme based on current app theme
	const sandpackTheme = resolvedTheme === "dark" ? "dark" : "light";

	const defaultDependencies = {
		"@radix-ui/react-slot": "^1.0.2",
		"class-variance-authority": "^0.7.0",
		clsx: "^2.0.0",
		"lucide-react": "^0.263.1",
		"tailwind-merge": "^1.14.0",
		"@types/react": "^18.2.0",
		"@types/react-dom": "^18.2.0",
	};

	return (
		<div className="w-full rounded-lg border bg-background">
			<Sandpack
				template={template}
				files={files}
				customSetup={{
					dependencies: {
						...defaultDependencies,
						...customSetup?.dependencies,
					},
					devDependencies: customSetup?.devDependencies,
				}}
				theme={sandpackTheme}
				options={{
					showNavigator,
					showTabs,
					showLineNumbers,
					editorHeight,
					editorWidthPercentage,
					wrapContent,
					classes: {
						"sp-wrapper": "!bg-background !border-border",
						"sp-layout": "!bg-background",
						"sp-tab-button": "!text-foreground hover:!text-foreground/80",
						"sp-code-editor": "!bg-background",
						"sp-preview-container": "!bg-background",
					},
				}}
			/>
		</div>
	);
}

export function SimpleSandbox({
	code,
	preview = true,
}: {
	code: string;
	preview?: boolean;
}) {
	const { resolvedTheme } = useTheme();
	const sandpackTheme = resolvedTheme === "dark" ? "dark" : "light";

	const files = {
		"/App.tsx": code,
		"/styles.css": `
			@import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.3.0/tailwind.min.css');
			
			body {
				font-family: system-ui, -apple-system, sans-serif;
				margin: 0;
				padding: 1rem;
			}
		`,
	};

	if (!preview) {
		return (
			<SandpackProvider
				template="react-ts"
				files={files}
				theme={sandpackTheme}
				customSetup={{
					dependencies: {
						"@radix-ui/react-slot": "^1.0.2",
						"class-variance-authority": "^0.7.0",
						clsx: "^2.0.0",
						"lucide-react": "^0.263.1",
						"tailwind-merge": "^1.14.0",
					},
				}}
			>
				<SandpackLayout>
					<SandpackCodeEditor
						showTabs={false}
						showLineNumbers={true}
						wrapContent={true}
						style={{ height: "300px" }}
					/>
				</SandpackLayout>
			</SandpackProvider>
		);
	}

	return (
		<CodeSandbox
			files={files}
			options={{
				editorHeight: 400,
				showTabs: false,
				showNavigator: false,
			}}
		/>
	);
}
