import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { categories, componentCategories, toolCategories } from "../db/schema";
import { adminProcedure, publicProcedure, router } from "../lib/trpc";
import { createCategorySchema, idSchema } from "../lib/validation";

export const categoriesRouter = router({
	// Public: Get all categories with counts
	getAll: publicProcedure.query(async () => {
		const categoriesWithCounts = await db
			.select({
				id: categories.id,
				name: categories.name,
				componentCount: count(componentCategories.componentId),
				toolCount: count(toolCategories.toolId),
			})
			.from(categories)
			.leftJoin(
				componentCategories,
				eq(categories.id, componentCategories.categoryId),
			)
			.leftJoin(toolCategories, eq(categories.id, toolCategories.categoryId))
			.groupBy(categories.id, categories.name);

		return categoriesWithCounts;
	}),

	// Public: Get category by ID
	getById: publicProcedure.input(idSchema).query(async ({ input }) => {
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
	delete: adminProcedure.input(idSchema).mutation(async ({ input }) => {
		await db.delete(categories).where(eq(categories.id, input.id));
		return { success: true };
	}),
});
