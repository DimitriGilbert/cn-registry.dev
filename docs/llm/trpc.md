# tRPC 11.x Core Concepts Summary
see apps/web/src/app/default_home.tsx for simple example.
## Router
- A `router` is the primary unit defining procedures and nesting routes.
- Created via `initTRPC()`:
  ```ts
  import { initTRPC } from '@trpc/server';
  const t = initTRPC.create();
  export const appRouter = t.router({
    getUser: t.procedure.query(() => ...),
    createPost: t.procedure.input(z.object(...)).mutation(() => ...)
  });
```

## Procedure Types

- `.query(() => ...)`: used for reading data.
- `.mutation(() => ...)`: used for modifying data.
- `.subscription(() => ...)`: for real-time data via observables (optional, requires ws).

## Input Validation

- Use Zod schemas with `.input()`:

  ```ts
  t.procedure.input(z.object({ id: z.string() }));
  ```

## Context

- Pass user/session/DB instances via `createContext()` and `ctx`:

  ```ts
  export const createContext = ({ req, res }) => ({ user: ..., db: ... });
  ```

## Caller

- For calling procedures inside your backend (e.g., tests, auth):

  ```ts
  const caller = appRouter.createCaller(context);
  const result = await caller.getUser();
  ```

## Router Composition

- Nest routers:

  ```ts
  const postsRouter = t.router({ ... });
  const usersRouter = t.router({ ... });
  const appRouter = t.router({
    posts: postsRouter,
    users: usersRouter
  });
  ```

## Export Types

- Export type-safe procedure types to your frontend:

  ```ts
  export type AppRouter = typeof appRouter;
  ```

---

## Client Usage (w/ TanStack React Query)

- Create tRPC client:

  ```ts
  import { createTRPCReact } from "@trpc/react-query";
  import type { AppRouter } from "@/server";
  export const trpc = createTRPCReact<AppRouter>();
  ```

- In `_app.tsx`:

  ```tsx
  <TRPCProvider client={...} queryClient={...}>
    <QueryClientProvider ... />
  </TRPCProvider>
  ```

- Use in components:

  ```tsx
  const { data } = trpc.getUser.useQuery();
  const mutation = trpc.createPost.useMutation();
  ```

---

## Error Handling

- tRPC throws structured errors (TRPCClientError).
- Use `onError` in `TRPCProvider` or wrap queries/mutations in `try/catch`.

---

## Middleware

- Define auth, logging, etc.:

  ```ts
  const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
  ```

- Use in procedure:

  ```ts
  t.procedure.use(isAuthed).query(() => ...)
  ```

---

## Deployment

- API handlers:

  - **Next.js App Router**:

    ```ts
    export const handler = createNextRouteHandler({
      router: appRouter,
      createContext,
    });
    export const GET = handler;
    export const POST = handler;
    ```

---

# Notes

- Uses Zod for validation.
- Supports file uploads via adapters (e.g., form-data parser).
- Native support for TanStack Query, React, and App Router.
