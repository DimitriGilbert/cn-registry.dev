import { sql } from "drizzle-orm";
import {
	pgTable,
	primaryKey,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const stars = pgTable(
	"stars",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		itemType: text("item_type").notNull(), // 'component' or 'tool'
		itemId: uuid("item_id").notNull(),
		starredAt: timestamp("starred_at", { withTimezone: true })
			.notNull()
			.default(sql`now()`),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.userId, table.itemType, table.itemId] }),
		};
	},
);

export const ratings = pgTable(
	"ratings",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		itemType: text("item_type").notNull(), // 'component' or 'tool'
		itemId: uuid("item_id").notNull(),
		rating: smallint("rating").notNull(), // 1-5
		ratedAt: timestamp("rated_at", { withTimezone: true })
			.notNull()
			.default(sql`now()`),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.userId, table.itemType, table.itemId] }),
		};
	},
);

export const comments = pgTable("comments", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	itemType: text("item_type").notNull(), // 'component' or 'tool'
	itemId: uuid("item_id").notNull(),
	parentId: uuid("parent_id"),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});
