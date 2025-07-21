import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

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

export const db = drizzle(databaseUrl, { schema });
