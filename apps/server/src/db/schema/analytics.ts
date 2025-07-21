import { sql } from "drizzle-orm";
import {
	bigserial,
	date,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const analyticsEvents = pgTable("analytics_events", {
	id: bigserial("id", { mode: "bigint" }).primaryKey(),
	eventType: text("event_type").notNull(), // 'view', 'install', 'star', 'comment'
	itemType: text("item_type").notNull(), // 'component' or 'tool'
	itemId: uuid("item_id").notNull(),
	userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
	referrer: text("referrer"), // Track referrer URL for traffic source analysis
	userAgent: text("user_agent"), // Track user agent for device/browser analysis
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const countersCache = pgTable("counters_cache", {
	id: bigserial("id", { mode: "bigint" }).primaryKey(),
	date: date("date").notNull(),
	itemType: text("item_type").notNull(),
	itemId: uuid("item_id").notNull(),
	viewsCount: integer("views_count").notNull().default(0),
	installsCount: integer("installs_count").notNull().default(0),
	starsCount: integer("stars_count").notNull().default(0),
	commentsCount: integer("comments_count").notNull().default(0),
});
