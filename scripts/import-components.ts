#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../apps/server/src/db";
import {
	categories,
	componentCategories,
	components,
	user,
} from "../apps/server/src/db/schema";

// Load environment variables from server app
const envPath = resolve(__dirname, "../apps/server/.env");
const result = config({ path: envPath });

if (result.error) {
	console.error("❌ Error loading .env file:", result.error);
	process.exit(1);
}

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL not found in environment variables");
	console.log(`Tried to load from: ${envPath}`);
	process.exit(1);
}

interface ComponentData {
	name: string;
	description?: string;
	repoUrl?: string;
	websiteUrl?: string;
	installUrl?: string;
	installCommand?: string;
	tags?: string[];
	status?: "published" | "draft" | "archived" | "suggested";
	categoryNames?: string[];
}

const DEFAULT_VALUES = {
	description: "Component description",
	status: "suggested" as const,
	tags: [] as string[],
	categoryNames: [] as string[],
};

async function getOrCreateCategory(name: string): Promise<string> {
	// Check if category exists
	const existingCategory = await db
		.select()
		.from(categories)
		.where(eq(categories.name, name))
		.limit(1);

	if (existingCategory.length > 0) {
		return existingCategory[0].id;
	}

	// Create new category
	const [newCategory] = await db
		.insert(categories)
		.values({ name })
		.returning();

	console.log(`📁 Created new category: "${name}"`);
	return newCategory.id;
}

async function getSystemUserId(): Promise<string> {
	// Find a system user or admin to assign components to
	const systemUser = await db
		.select()
		.from(user)
		.where(eq(user.role, "admin"))
		.limit(1);

	if (systemUser.length === 0) {
		// Create a default admin user for component imports
		console.log("🔧 No admin user found, creating default admin user...");
		const [newAdmin] = await db
			.insert(user)
			.values({
				id: `admin-${Date.now()}`,
				email: "admin@system.local",
				name: "System Admin",
				role: "admin",
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		console.log(`✅ Created admin user: ${newAdmin.email}`);
		return newAdmin.id;
	}

	return systemUser[0].id;
}

async function importComponent(
	componentData: ComponentData,
	systemUserId: string,
): Promise<void> {
	// Apply default values for missing fields
	const component = {
		name: componentData.name,
		description: componentData.description || DEFAULT_VALUES.description,
		repoUrl: componentData.repoUrl || null,
		websiteUrl: componentData.websiteUrl || null,
		installUrl: componentData.installUrl || null,
		installCommand: componentData.installCommand || null,
		tags: componentData.tags || DEFAULT_VALUES.tags,
		status: componentData.status || DEFAULT_VALUES.status,
		creatorId: systemUserId,
	};

	try {
		// Check if component already exists
		const existingComponent = await db
			.select()
			.from(components)
			.where(eq(components.name, component.name))
			.limit(1);

		if (existingComponent.length > 0) {
			console.log(
				`⚠️  Component "${component.name}" already exists, skipping...`,
			);
			return;
		}

		// Insert component
		const [insertedComponent] = await db
			.insert(components)
			.values(component)
			.returning();

		console.log(
			`✅ Imported component: "${component.name}" (${component.status})`,
		);

		// Handle categories
		const categoryNames =
			componentData.categoryNames || DEFAULT_VALUES.categoryNames;
		if (categoryNames.length > 0) {
			const categoryIds = await Promise.all(
				categoryNames.map((name) => getOrCreateCategory(name)),
			);

			// Link component to categories
			const categoryLinks = categoryIds.map((categoryId) => ({
				componentId: insertedComponent.id,
				categoryId,
			}));

			await db.insert(componentCategories).values(categoryLinks);
			console.log(`  📂 Linked to categories: ${categoryNames.join(", ")}`);
		}
	} catch (error) {
		console.error(`❌ Failed to import component "${component.name}":`, error);
		if (error instanceof Error && error.message.includes("duplicate key")) {
			console.log(`  → Component "${component.name}" already exists`);
		}
	}
}

async function main() {
	const jsonFilePath = process.argv[2];

	if (!jsonFilePath) {
		console.error("❌ Please provide a JSON file path");
		console.log("Usage: bun scripts/import-components.ts <json-file>");
		console.log(
			"Example: bun scripts/import-components.ts scripts/components-example.json",
		);
		process.exit(1);
	}

	try {
		// Read and parse JSON file
		const jsonContent = readFileSync(resolve(jsonFilePath), "utf-8");
		const componentsData: ComponentData[] = JSON.parse(jsonContent);

		if (!Array.isArray(componentsData)) {
			throw new Error("JSON file must contain an array of components");
		}

		console.log(`📦 Found ${componentsData.length} components to import`);

		// Test database connection and get system user ID
		console.log("🔌 Testing database connection...");
		const systemUserId = await getSystemUserId();
		console.log(`👤 Using system user ID: ${systemUserId}`);

		// Import each component
		let importedCount = 0;
		let skippedCount = 0;

		for (const componentData of componentsData) {
			if (!componentData.name) {
				console.log("⚠️  Skipping component with missing name:", componentData);
				skippedCount++;
				continue;
			}

			try {
				await importComponent(componentData, systemUserId);
				importedCount++;
			} catch (error) {
				console.error(`❌ Failed to import "${componentData.name}":`, error);
				skippedCount++;
			}
		}

		console.log("\n🎉 Import completed!");
		console.log(`  ✅ Imported: ${importedCount} components`);
		console.log(`  ⚠️  Skipped: ${skippedCount} components`);
	} catch (error) {
		console.error("❌ Error during import:", error);

		if (
			(error instanceof Error && error.message.includes("SASL")) ||
			(error instanceof Error && error.message.includes("password"))
		) {
			console.log("\n💡 Database connection failed. Please ensure:");
			console.log("   1. Database is running: bun run db:start");
			console.log(
				"   2. Environment variables are correct in apps/server/.env",
			);
			console.log("   3. Database schema is up to date: bun run db:push");
		}

		if (
			error instanceof Error &&
			error.message.includes("No admin user found")
		) {
			console.log("\n💡 No admin user found. Please create one first:");
			console.log("   bun scripts/make-admin.ts <email>");
		}

		process.exit(1);
	}
}

main();
