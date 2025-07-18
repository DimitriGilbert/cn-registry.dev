import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { adminRouter } from "./admin";
import { analyticsRouter } from "./analytics";
import { categoriesRouter } from "./categories";
import { componentsRouter } from "./components";
import { themesRouter } from "./themes";
import { toolsRouter } from "./tools";
import { usersRouter } from "./users";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),

	// Feature routers
	users: usersRouter,
	components: componentsRouter,
	tools: toolsRouter,
	categories: categoriesRouter,
	analytics: analyticsRouter,
	admin: adminRouter,
	themes: themesRouter,
});

export type AppRouter = typeof appRouter;
