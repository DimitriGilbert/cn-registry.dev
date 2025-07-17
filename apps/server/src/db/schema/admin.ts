import { pgTable, bigserial, text, uuid, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const editsLog = pgTable("edits_log", {
	id: bigserial("id", { mode: "bigint" }).primaryKey(),
	itemType: text("item_type").notNull(), // 'component' or 'tool'
	itemId: uuid("item_id").notNull(),
	editorId: text("editor_id").references(() => user.id, { onDelete: "cascade" }),
	changes: jsonb("changes").notNull(),
	editedAt: timestamp("edited_at", { withTimezone: true }).notNull().default(sql`now()`)
});

export const adminNotifications = pgTable("admin_notifications", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	message: text("message").notNull(),
	isRead: boolean("is_read").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`)
});