import { pgTable, uuid, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const themes = pgTable("themes", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull().unique(),
	tokens: jsonb("tokens").notNull(),
	createdBy: text("created_by").references(() => user.id, { onDelete: "cascade" }),
	isDefault: boolean("is_default").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`)
});