import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { themes, user } from "../db/schema";
import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "../lib/trpc";
import { createThemeSchema, idSchema } from "../lib/validation";

export const themesRouter = router({
	// Public: Get all themes
	getAll: publicProcedure.query(async () => {
		const allThemes = await db
			.select({
				id: themes.id,
				name: themes.name,
				tokens: themes.tokens,
				isDefault: themes.isDefault,
				createdAt: themes.createdAt,
				creator: {
					id: user.id,
					name: user.name,
					username: user.username,
				},
			})
			.from(themes)
			.leftJoin(user, eq(themes.createdBy, user.id))
			.orderBy(desc(themes.isDefault), desc(themes.createdAt));

		return allThemes;
	}),

	// Public: Get theme by ID
	getById: publicProcedure.input(idSchema).query(async ({ input }) => {
		const theme = await db
			.select({
				id: themes.id,
				name: themes.name,
				tokens: themes.tokens,
				isDefault: themes.isDefault,
				createdAt: themes.createdAt,
				creator: {
					id: user.id,
					name: user.name,
					username: user.username,
				},
			})
			.from(themes)
			.leftJoin(user, eq(themes.createdBy, user.id))
			.where(eq(themes.id, input.id))
			.limit(1);

		if (!theme[0]) {
			throw new Error("Theme not found");
		}

		return theme[0];
	}),

	// Public: Get default theme
	getDefault: publicProcedure.query(async () => {
		const defaultTheme = await db
			.select()
			.from(themes)
			.where(eq(themes.isDefault, true))
			.limit(1);

		return defaultTheme[0] || null;
	}),

	// Protected: Create theme
	create: protectedProcedure
		.input(createThemeSchema)
		.mutation(async ({ ctx, input }) => {
			// Only admins can create default themes
			if (input.isDefault && ctx.user.role !== "admin") {
				throw new Error("Only admins can create default themes");
			}

			const [newTheme] = await db
				.insert(themes)
				.values({
					...input,
					createdBy: ctx.user.id,
				})
				.returning();

			// If this is set as default, unset other defaults
			if (input.isDefault) {
				await db
					.update(themes)
					.set({ isDefault: false })
					.where(eq(themes.isDefault, true));

				await db
					.update(themes)
					.set({ isDefault: true })
					.where(eq(themes.id, newTheme.id));
			}

			return newTheme;
		}),

	// Protected: Update theme
	update: protectedProcedure
		.input(idSchema.extend(createThemeSchema.partial().shape))
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Check if user owns theme or is admin
			const theme = await db
				.select()
				.from(themes)
				.where(eq(themes.id, id))
				.limit(1);

			if (!theme[0]) {
				throw new Error("Theme not found");
			}

			if (theme[0].createdBy !== ctx.user.id && ctx.user.role !== "admin") {
				throw new Error("Forbidden: You can only edit your own themes");
			}

			// Only admins can modify default status
			if ("isDefault" in updateData && ctx.user.role !== "admin") {
				delete updateData.isDefault;
			}

			const [updatedTheme] = await db
				.update(themes)
				.set(updateData)
				.where(eq(themes.id, id))
				.returning();

			// If this is set as default, unset other defaults
			if (updateData.isDefault) {
				await db
					.update(themes)
					.set({ isDefault: false })
					.where(eq(themes.isDefault, true));

				await db
					.update(themes)
					.set({ isDefault: true })
					.where(eq(themes.id, id));
			}

			return updatedTheme;
		}),

	// Protected: Delete theme
	delete: protectedProcedure
		.input(idSchema)
		.mutation(async ({ ctx, input }) => {
			const theme = await db
				.select()
				.from(themes)
				.where(eq(themes.id, input.id))
				.limit(1);

			if (!theme[0]) {
				throw new Error("Theme not found");
			}

			if (theme[0].createdBy !== ctx.user.id && ctx.user.role !== "admin") {
				throw new Error("Forbidden: You can only delete your own themes");
			}

			// Prevent deletion of default theme
			if (theme[0].isDefault) {
				throw new Error("Cannot delete the default theme");
			}

			await db.delete(themes).where(eq(themes.id, input.id));
			return { success: true };
		}),

	// Admin: Set default theme
	setDefault: adminProcedure.input(idSchema).mutation(async ({ input }) => {
		// Unset current default
		await db
			.update(themes)
			.set({ isDefault: false })
			.where(eq(themes.isDefault, true));

		// Set new default
		const [updatedTheme] = await db
			.update(themes)
			.set({ isDefault: true })
			.where(eq(themes.id, input.id))
			.returning();

		return updatedTheme;
	}),
});
