#!/usr/bin/env bun

import { resolve } from "node:path";
import { config } from "dotenv";
import { db } from "../apps/server/src/db";
import { 
	components, 
	componentCategories, 
	stars, 
	ratings, 
	comments,
	projectComponents 
} from "../apps/server/src/db/schema";
import { eq } from "drizzle-orm";

// Load environment variables from server app
config({ path: resolve(__dirname, "../apps/server/.env") });

async function clearComponents() {
	console.log("🗑️  Clearing all components data...");
	
	try {
		// Delete in order to respect foreign key constraints
		console.log("Deleting project components...");
		await db.delete(projectComponents);
		
		console.log("Deleting component ratings...");
		await db.delete(ratings).where(eq(ratings.itemType, "component"));
		
		console.log("Deleting component stars...");
		await db.delete(stars).where(eq(stars.itemType, "component"));
		
		console.log("Deleting component comments...");
		await db.delete(comments).where(eq(comments.itemType, "component"));
		
		console.log("Deleting component categories...");
		await db.delete(componentCategories);
		
		console.log("Deleting components...");
		const result = await db.delete(components);
		
		console.log("✅ All components data cleared successfully!");
		console.log(`Deleted components and all related data.`);
		
	} catch (error) {
		console.error("❌ Error clearing components:", error);
		process.exit(1);
	}
	
	process.exit(0);
}

clearComponents();