import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [
		"https://cn-registry.dev", 
		"https://api.cn-registry.dev",
		process.env.CORS_ORIGIN || ""
	].filter(Boolean),
	emailAndPassword: {
		enabled: true,
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
			},
		},
	},
});
