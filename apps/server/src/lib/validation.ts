import { z } from "zod";

// User schemas
export const createUserSchema = z.object({
	username: z.string().min(3).max(50),
	email: z.string().email(),
	password: z.string().min(8),
	avatarUrl: z.string().url().optional(),
});

export const updateUserSchema = z.object({
	username: z.string().min(3).max(50).optional(),
	email: z.string().email().optional(),
	avatarUrl: z.string().url().optional(),
	bio: z.string().max(500).optional(),
	website: z.string().url().optional(),
	location: z.string().max(100).optional(),
	company: z.string().max(100).optional(),
	socialLinks: z.record(z.string(), z.string().url()).optional(),
	specialties: z.array(z.string()).optional(),
});

export const updateUserSettingsSchema = z.object({
	theme: z.string().optional(),
	notifications: z.record(z.string(), z.boolean()).optional(),
	locale: z.string().optional(),
});

// Component schemas
export const createComponentSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	repoUrl: z.string().url().optional(),
	websiteUrl: z.string().url().optional(),
	installUrl: z.string().optional(),
	installCommand: z.string().optional(),
	tags: z.array(z.string()).optional(),
	status: z.enum(["published", "draft", "archived", "suggested"]).optional(),
	categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateComponentSchema = createComponentSchema.partial();

// Tool schemas
export const createToolSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	repoUrl: z.string().url().optional(),
	websiteUrl: z.string().url().optional(),
	installUrl: z.string().optional(),
	installCommand: z.string().optional(),
	tags: z.array(z.string()).optional(),
	status: z.enum(["published", "draft", "archived", "suggested"]).optional(),
	categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateToolSchema = createToolSchema.partial();

// Category schemas
export const createCategorySchema = z.object({
	name: z.string().min(1).max(50),
});

// Engagement schemas
export const createCommentSchema = z.object({
	itemType: z.enum(["component", "tool"]),
	itemId: z.string().uuid(),
	content: z.string().min(1).max(1000),
	parentId: z.string().uuid().optional(),
});

export const rateItemSchema = z.object({
	itemType: z.enum(["component", "tool"]),
	itemId: z.string().uuid(),
	rating: z.number().int().min(1).max(5),
});

export const starItemSchema = z.object({
	itemType: z.enum(["component", "tool"]),
	itemId: z.string().uuid(),
});

// Analytics schemas
export const trackEventSchema = z.object({
	eventType: z.enum(["view", "install", "star", "comment"]),
	itemType: z.enum(["component", "tool"]),
	itemId: z.string().uuid(),
});

// Theme schemas
export const createThemeSchema = z.object({
	name: z.string().min(1).max(50),
	tokens: z.record(z.string(), z.any()),
	isDefault: z.boolean().optional(),
});

// Admin schemas
export const createAdminNotificationSchema = z.object({
	title: z.string().min(1).max(200),
	message: z.string().min(1).max(1000),
	type: z.enum(["info", "warning", "error", "success"]).default("info"),
});

// Common schemas
export const paginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
});

export const searchSchema = z.object({
	query: z.string().optional(),
	categoryId: z.string().uuid().optional(),
	...paginationSchema.shape,
});

export const idSchema = z.object({
	id: z.string().uuid(),
});

// Project schemas
export const createProjectSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	visibility: z.enum(["private", "public"]).default("private"),
});

export const updateProjectSchema = createProjectSchema.partial();

export const addComponentsToProjectSchema = z.object({
	projectId: z.string().uuid(),
	componentIds: z.array(z.string().uuid()),
});

export const removeComponentFromProjectSchema = z.object({
	projectId: z.string().uuid(),
	componentId: z.string().uuid(),
});

export const projectIdSchema = z.object({
	projectId: z.string().uuid(),
});

export const projectSlugSchema = z.object({
	slug: z.string(),
});

export const addCollaboratorSchema = z.object({
	projectId: z.string().uuid(),
	userId: z.string(),
	role: z.enum(["owner", "editor", "viewer"]).default("viewer"),
});

export const removeCollaboratorSchema = z.object({
	projectId: z.string().uuid(),
	userId: z.string(),
});

export const updateCollaboratorRoleSchema = z.object({
	projectId: z.string().uuid(),
	userId: z.string(),
	role: z.enum(["owner", "editor", "viewer"]),
});

export const generateInstallConfigSchema = z.object({
	projectId: z.string().uuid(),
	format: z.enum(["registry", "cli", "package-json"]).default("registry"),
});

export const getByIdsSchema = z.object({
	ids: z.array(z.string().uuid()),
});

// GitHub schemas
export const githubRepoSchema = z.object({
	repoUrl: z.string().url(),
});

export const usernameSchema = z.object({
	username: z.string(),
});
