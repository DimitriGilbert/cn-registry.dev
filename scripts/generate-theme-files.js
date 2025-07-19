#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const REGISTRY_FILE = path.join(__dirname, "..", "tweakcn-registry.json");
const THEMES_DIR = path.join(
	__dirname,
	"..",
	"apps",
	"web",
	"src",
	"styles",
	"themes",
);
const THEME_LOADER_FILE = path.join(
	__dirname,
	"..",
	"apps",
	"web",
	"src",
	"lib",
	"theme-loader.ts",
);

function parseRegistry() {
	try {
		const registryContent = fs.readFileSync(REGISTRY_FILE, "utf8");
		const registry = JSON.parse(registryContent);
		return registry.items || [];
	} catch (error) {
		console.error("Error reading registry file:", error.message);
		process.exit(1);
	}
}

function generateThemeCSS(theme) {
	const { name, cssVars } = theme;
	const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

	if (!cssVars || !cssVars.light || !cssVars.dark) {
		return null;
	}

	const coreVars = [
		"background",
		"foreground",
		"card",
		"card-foreground",
		"popover",
		"popover-foreground",
		"primary",
		"primary-foreground",
		"secondary",
		"secondary-foreground",
		"muted",
		"muted-foreground",
		"accent",
		"accent-foreground",
		"destructive",
		"destructive-foreground",
		"border",
		"input",
		"ring",
		"chart-1",
		"chart-2",
		"chart-3",
		"chart-4",
		"chart-5",
	];

	let css = `/* ${theme.title || name} Theme */\n`;
	css += "@layer base {\n";

	// Light theme
	css += `\t.${slug} {\n`;
	coreVars.forEach((varName) => {
		const value = cssVars.light[varName];
		if (value) {
			css += `\t\t--${varName}: ${value};\n`;
		}
	});

	if (cssVars.theme?.radius || cssVars.light.radius) {
		css += `\t\t--radius: ${cssVars.theme?.radius || cssVars.light.radius};\n`;
	}

	css += "\t}\n\n";

	// Dark theme
	css += `\t.dark .${slug} {\n`;
	coreVars.forEach((varName) => {
		const value = cssVars.dark[varName];
		if (value) {
			css += `\t\t--${varName}: ${value};\n`;
		}
	});
	css += "\t}\n";
	css += "}\n";

	return { slug, css, theme };
}

function updateThemeLoader(themes) {
	const themeList = themes
		.map(
			({ slug, theme }) =>
				`\t{\n\t\tname: "${theme.title || theme.name}",\n\t\tslug: "${slug}",\n\t},`,
		)
		.join("\n");

	const newContent = `"use client";

export const AVAILABLE_THEMES = [
	{
		name: "Default",
		slug: "default",
	},
${themeList}
];

export async function loadTheme(themeName: string) {
	if (themeName === "default" || themeName === "light" || themeName === "dark" || themeName === "system") {
		return;
	}

	try {
		await import(\`@/styles/themes/\${themeName}.css\`);
	} catch (error) {
		console.error(\`Failed to load theme \${themeName}:\`, error);
	}
}`;

	fs.writeFileSync(THEME_LOADER_FILE, newContent);
}

async function main() {
	console.log("🎨 Generating theme files from registry...");

	if (!fs.existsSync(THEMES_DIR)) {
		fs.mkdirSync(THEMES_DIR, { recursive: true });
	}

	const registryItems = parseRegistry();
	console.log(`📋 Found ${registryItems.length} items in registry`);

	const themes = [];
	let processedCount = 0;

	for (const item of registryItems) {
		if (item.type !== "registry:style" || !item.cssVars) {
			continue;
		}

		const themeData = generateThemeCSS(item);
		if (themeData) {
			const { slug, css } = themeData;
			const filePath = path.join(THEMES_DIR, `${slug}.css`);

			try {
				fs.writeFileSync(filePath, css);
				themes.push(themeData);
				processedCount++;
				console.log(`✅ Generated: ${slug}.css`);
			} catch (error) {
				console.error(`❌ Failed to write ${slug}.css:`, error.message);
			}
		}
	}

	if (themes.length > 0) {
		console.log("\n🔄 Updating theme loader...");
		updateThemeLoader(themes);
		console.log("✅ Theme loader updated");
	}

	console.log(`\n📊 Generated ${processedCount} theme files`);
}

main().catch(console.error);
