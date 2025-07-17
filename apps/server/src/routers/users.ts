import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../lib/trpc";
import { db } from "../db";
import { user, userSettings } from "../db/schema";
import { eq } from "drizzle-orm";
import { updateUserSchema, updateUserSettingsSchema, idSchema } from "../lib/validation";

export const usersRouter = router({
	// Get current user profile
	me: protectedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),

	// Update current user profile
	updateProfile: protectedProcedure
		.input(updateUserSchema)
		.mutation(async ({ ctx, input }) => {
			const [updatedUser] = await db
				.update(user)
				.set({ ...input, updatedAt: new Date() })
				.where(eq(user.id, ctx.user.id))
				.returning();
			
			return updatedUser;
		}),

	// Get user settings
	getSettings: protectedProcedure.query(async ({ ctx }) => {
		const settings = await db
			.select()
			.from(userSettings)
			.where(eq(userSettings.userId, ctx.user.id))
			.limit(1);
		
		return settings[0] || null;
	}),

	// Update user settings
	updateSettings: protectedProcedure
		.input(updateUserSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const [settings] = await db
				.insert(userSettings)
				.values({
					userId: ctx.user.id,
					...input,
				})
				.onConflictDoUpdate({
					target: userSettings.userId,
					set: input,
				})
				.returning();
			
			return settings;
		}),

	// Admin: Get all users
	getAll: adminProcedure.query(async () => {
		return await db.select().from(user);
	}),

	// Admin: Update user role
	updateRole: adminProcedure
		.input(idSchema.extend({
			role: z.enum(["user", "creator", "admin"]),
		}))
		.mutation(async ({ input }) => {
			const [updatedUser] = await db
				.update(user)
				.set({ role: input.role, updatedAt: new Date() })
				.where(eq(user.id, input.id))
				.returning();
			
			return updatedUser;
		}),
});