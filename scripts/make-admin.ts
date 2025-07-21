#!/usr/bin/env bun

import { resolve } from "node:path";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../apps/server/src/db";
import { user } from "../apps/server/src/db/schema";

// Load environment variables from server app
config({ path: resolve(__dirname, "../apps/server/.env") });

async function makeAdmin() {
	const email = process.argv[2];

	if (!email) {
		console.error("❌ Please provide an email address");
		console.log("Usage: bun scripts/make-admin.ts <email>");
		process.exit(1);
	}

	try {
		// Find user by email
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.email, email))
			.limit(1);

		if (existingUser.length === 0) {
			console.error(`❌ User with email "${email}" not found`);
			console.log("Make sure the user has signed up first");
			process.exit(1);
		}

		const currentUser = existingUser[0];

		if (currentUser.role === "admin") {
			console.log(`✅ User "${email}" is already an admin`);
			process.exit(0);
		}

		// Update user role to admin
		await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

		console.log(`🎉 Successfully made "${email}" an admin!`);
		console.log(`User: ${currentUser.name} (${currentUser.email})`);
		console.log("They can now access the admin panel");
	} catch (error) {
		console.error("❌ Error making user admin:", error);
		process.exit(1);
	}
}

makeAdmin();
