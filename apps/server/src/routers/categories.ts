import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../lib/trpc";
import { db } from "../db";
import { categories } from "../db/schema";
import { eq } from "drizzle-orm";
import { createCategorySchema, idSchema } from "../lib/validation";

export const categoriesRouter = router({
	// Public: Get all categories
	getAll: publicProcedure.query(async () => {
		return await db.select().from(categories);
	}),

	// Public: Get category by ID
	getById: publicProcedure
		.input(idSchema)
		.query(async ({ input }) => {
			const category = await db
				.select()
				.from(categories)
				.where(eq(categories.id, input.id))
				.limit(1);

			if (!category[0]) {
				throw new Error("Category not found");
			}

			return category[0];
		}),

	// Admin: Create category
	create: adminProcedure
		.input(createCategorySchema)
		.mutation(async ({ input }) => {
			const [newCategory] = await db
				.insert(categories)
				.values(input)
				.returning();

			return newCategory;
		}),

	// Admin: Update category
	update: adminProcedure
		.input(idSchema.extend(createCategorySchema.shape))
		.mutation(async ({ input }) => {
			const { id, ...updateData } = input;

			const [updatedCategory] = await db
				.update(categories)
				.set(updateData)
				.where(eq(categories.id, id))
				.returning();

			return updatedCategory;
		}),

	// Admin: Delete category
	delete: adminProcedure
		.input(idSchema)
		.mutation(async ({ input }) => {
			await db.delete(categories).where(eq(categories.id, input.id));
			return { success: true };
		}),
});