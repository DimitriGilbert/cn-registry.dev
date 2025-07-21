import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Build DATABASE_URL from individual environment variables
const buildDatabaseUrl = () => {
	const user = process.env.POSTGRES_USER || "postgres";
	const password = process.env.POSTGRES_PASSWORD || "postgres";
	const host = process.env.POSTGRES_HOST || "postgres"; // Changed from localhost to postgres
	const port = process.env.POSTGRES_PORT || "5432";
	const database = process.env.POSTGRES_DB || "cn_registry";
	
	const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;
	console.log("Database URL:", url.replace(password, "***")); // Debug log without exposing password
	return url;
};

const databaseUrl = process.env.DATABASE_URL || buildDatabaseUrl();

export const db = drizzle(databaseUrl, { schema });
