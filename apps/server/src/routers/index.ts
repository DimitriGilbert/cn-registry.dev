import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { usersRouter } from "./users";
import { componentsRouter } from "./components";
import { toolsRouter } from "./tools";
import { categoriesRouter } from "./categories";
import { analyticsRouter } from "./analytics";
import { adminRouter } from "./admin";
import { themesRouter } from "./themes";

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
