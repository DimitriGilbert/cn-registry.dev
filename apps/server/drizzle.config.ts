import { defineConfig } from "drizzle-kit";

// Build DATABASE_URL from individual environment variables
const buildDatabaseUrl = () => {
	const user = process.env.POSTGRES_USER || "postgres";
	const password = process.env.POSTGRES_PASSWORD || "postgres";
	const host = process.env.POSTGRES_HOST || "postgres";
	const port = process.env.POSTGRES_PORT || "5432";
	const database = process.env.POSTGRES_DB || "cn_registry";
	
	const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;
	console.log("Drizzle Database URL:", url.replace(password, "***"));
	return url;
};

const databaseUrl = buildDatabaseUrl(); // Always use the built URL

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
	},
});
