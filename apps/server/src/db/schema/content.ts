import { sql } from "drizzle-orm";
import {
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const categories = pgTable("categories", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull().unique(),
});

export const components = pgTable("components", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull().unique(),
	description: text("description").notNull(),
	repoUrl: text("repo_url"),
	websiteUrl: text("website_url"),
	installUrl: text("install_url"),
	installCommand: text("install_command"),
	tags: text("tags").array(),
	status: text("status").notNull().default("published"), // 'published', 'draft', 'archived', 'suggested'
	creatorId: text("creator_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const tools = pgTable("tools", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull().unique(),
	description: text("description").notNull(),
	repoUrl: text("repo_url"),
	websiteUrl: text("website_url"),
	installUrl: text("install_url"),
	installCommand: text("install_command"),
	tags: text("tags").array(),
	status: text("status").notNull().default("published"), // 'published', 'draft', 'archived', 'suggested'
	creatorId: text("creator_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const componentCategories = pgTable(
	"component_categories",
	{
		componentId: uuid("component_id")
			.notNull()
			.references(() => components.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "cascade" }),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.componentId, table.categoryId] }),
		};
	},
);

export const toolCategories = pgTable(
	"tool_categories",
	{
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "cascade" }),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.toolId, table.categoryId] }),
		};
	},
);

export const projects = pgTable("projects", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	description: text("description"),
	slug: text("slug").notNull().unique(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	visibility: text("visibility").notNull().default("private"), // 'private', 'public'
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
});

export const projectComponents = pgTable(
	"project_components",
	{
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		componentId: uuid("component_id")
			.notNull()
			.references(() => components.id, { onDelete: "cascade" }),
		addedAt: timestamp("added_at", { withTimezone: true })
			.notNull()
			.default(sql`now()`),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.projectId, table.componentId] }),
		};
	},
);

export const projectCollaborators = pgTable(
	"project_collaborators",
	{
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull().default("viewer"), // 'owner', 'editor', 'viewer'
		addedAt: timestamp("added_at", { withTimezone: true })
			.notNull()
			.default(sql`now()`),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.projectId, table.userId] }),
		};
	},
);

export const githubCache = pgTable("github_cache", {
	repoUrl: text("repo_url").primaryKey(),
	data: text("data").notNull(), // JSON string
	lastFetched: timestamp("last_fetched", { withTimezone: true })
		.notNull()
		.default(sql`now()`),
	expiresAt: timestamp("expires_at", { withTimezone: true })
		.notNull()
		.default(sql`now() + interval '6 hours'`),
});
