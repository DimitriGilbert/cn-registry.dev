# tRPC v11 Usage Guide (Project-Specific)

**CRITICAL:** This project uses tRPC v11 with TanStack React Query. The patterns described here are mandatory.

## Client-Side Patterns

### 1. Queries (Reading Data)

**Correct Pattern:**
```tsx
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const { data, isLoading, error } = useQuery(
  trpc.components.getAll.queryOptions({
    page: 1,
    limit: 10,
  })
);
```

### 2. Mutations (Writing Data)

**Correct Pattern:**
```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const queryClient = useQueryClient();

const createMutation = useMutation(
  trpc.components.create.mutationOptions({
    onSuccess: (data) => {
      toast.success("Component created!");
      queryClient.invalidateQueries({
        queryKey: trpc.components.getAll.queryKey(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Creation failed.");
    },
  })
);

// To use the mutation:
createMutation.mutate({ name: "New Component", ... });
```

### 3. Required Imports

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
```

---

## Server-Side Patterns

### Router Definition

-   Routers are located in `apps/server/src/routers/`.
-   The main router is `apps/server/src/routers/index.ts`.

**Example Router:**
```ts
// apps/server/src/routers/components.ts
import { publicProcedure, protectedProcedure, router } from "../lib/trpc";
import { z } from "zod";

export const componentsRouter = router({
  getAll: publicProcedure
    .input(z.object({ ... }))
    .query(async ({ ctx, input }) => {
      // ... database logic
    }),

  create: protectedProcedure
    .input(z.object({ ... }))
    .mutation(async ({ ctx, input }) => {
      // ... database logic
    }),
});
```

### Procedure Types

-   `publicProcedure`: For public endpoints that do not require authentication.
-   `protectedProcedure`: For endpoints that require a user to be logged in. The user's session is available in `ctx.session`.
-   `adminProcedure`: For endpoints that require the user to have the `admin` role.

---

## Real-World Examples from This Project

### Full CRUD in `AdminCategoriesPage`

-   **File:** `apps/web/src/app/admin/categories/page.tsx`
-   **Demonstrates:** `useQuery` for fetching all categories, and `useMutation` for create, update, and delete operations, including cache invalidation with `queryClient.invalidateQueries`.

### Form Integration in `NewComponentPage`

-   **File:** `apps/web/src/app/admin/components/new/page.tsx`
-   **Demonstrates:** Using a `useMutation` hook to handle the submission of a form created with `useFormedible`.

---

## Common Mistakes to Avoid

-   **Do not use `trpc.xxx.useQuery()` or `trpc.xxx.useMutation()`**. These are from older tRPC versions and are not used in this project.
-   **Do not import from `@trpc/react-query`**. All necessary hooks are re-exported from `@tanstack/react-query`.
-   **Do not use `trpc.useContext()`**. Instead, use the `useQueryClient` hook from `@tanstack/react-query`.