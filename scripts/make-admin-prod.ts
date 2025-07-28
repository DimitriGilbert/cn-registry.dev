#!/usr/bin/env bun

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { user } from "../apps/server/src/db/schema";

async function makeAdmin() {
	const email = process.argv[2];

	if (!email) {
		console.error("❌ Please provide an email address");
		console.log("Usage: bun scripts/make-admin-prod.ts <email>");
		console.log("Environment variables required:");
		console.log("  DATABASE_URL - PostgreSQL connection string");
		process.exit(1);
	}

	// Build DATABASE_URL from individual environment variables
	const buildDatabaseUrl = () => {
		const user = process.env.POSTGRES_USER || "postgres";
		const password = process.env.POSTGRES_PASSWORD || "postgres";
		const host = process.env.POSTGRES_HOST || "localhost";
		const port = process.env.POSTGRES_PORT || "5432";
		const database = process.env.POSTGRES_DB || "cn_registry";

		return `postgresql://${user}:${password}@${host}:${port}/${database}`;
	};

	const databaseUrl = process.env.DATABASE_URL || buildDatabaseUrl();

	try {
		// Initialize database connection using same approach as server
		const db = drizzle(databaseUrl);

		console.log(`🔍 Looking for user with email: ${email}`);

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
