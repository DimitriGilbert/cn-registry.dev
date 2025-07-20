# tRPC 11.x Complete Usage Guide - THIS PROJECT SPECIFIC

⚠️ **CRITICAL: This project uses tRPC v11 with TanStack React Query integration. Follow these patterns EXACTLY.**

## Working Examples in This Codebase

- **Query**: `apps/web/src/app/page.tsx` (lines 22-43)
- **Query**: `apps/web/src/app/default_home.tsx` (line 22)
- **Admin Pages**: `apps/web/src/app/admin/*/page.tsx` (mutation examples)

---

## 🚨 CRITICAL CLIENT PATTERNS - USE THESE EXACTLY

### 1. Queries (Reading Data)

**✅ CORRECT - Use this pattern:**

```tsx
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

// In component
const { data, isLoading, error } = useQuery(
  trpc.components.getAll.queryOptions({
    page: 1,
    limit: 10,
  })
);
```

**❌ NEVER DO THIS:**

```tsx
// DON'T USE - This is old tRPC pattern
const { data } = trpc.components.getAll.useQuery({ page: 1 });
```

### 2. Mutations (Modifying Data)

**✅ CORRECT - Use this pattern:**

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

// In component
const queryClient = useQueryClient();

const createMutation = useMutation(
  trpc.components.create.mutationOptions({
    onSuccess: (data) => {
      toast.success("Created successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.components.getAll.queryKey(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create");
    },
  })
);

// Use the mutation
const handleSubmit = (data) => {
  createMutation.mutate(data);
};
```

**❌ NEVER DO THIS:**

```tsx
// DON'T USE - These don't exist in this project's setup
const mutation = trpc.components.create.useMutation();
const mutation = useMutation({
  mutationFn: () => trpc.components.create.mutate(),
});
```

### 3. Required Imports

**✅ ALWAYS IMPORT THESE:**

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
```

---

## 🔧 Server-Side Patterns

### Router Definition

```ts
// apps/server/src/routers/example.ts
import { adminProcedure, publicProcedure, router } from "../lib/trpc";
import { z } from "zod";

export const exampleRouter = router({
  // Query example
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      // Database logic here
      return { data: [], total: 0 };
    }),

  // Mutation example
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Database logic here
      return { id: "123", ...input };
    }),
});
```

### Adding to Main Router

```ts
// apps/server/src/routers/index.ts
import { exampleRouter } from "./example";

export const appRouter = router({
  // Add your router here
  example: exampleRouter,

  // Existing routers
  users: usersRouter,
  components: componentsRouter,
  // ...
});
```

---

## 🎯 Real Working Examples from This Project

### Example 1: Simple Query

```tsx
// From apps/web/src/app/page.tsx
const { data: latestComponents, isLoading: isLatestLoading } = useQuery(
  trpc.components.getAll.queryOptions({
    page: 1,
    limit: 4,
  })
);
```

### Example 2: Categories Management (Full CRUD)

```tsx
// From apps/web/src/app/admin/categories/page.tsx
const queryClient = useQueryClient();

// Read
const { data: categories = [], isLoading } = useQuery(
  trpc.categories.getAll.queryOptions()
);

// Create
const createMutation = useMutation(
  trpc.categories.create.mutationOptions({
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.categories.getAll.queryKey(),
      });
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  })
);

// Update
const updateMutation = useMutation(
  trpc.categories.update.mutationOptions({
    onSuccess: () => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.categories.getAll.queryKey(),
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  })
);

// Delete
const deleteMutation = useMutation(
  trpc.categories.delete.mutationOptions({
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.categories.getAll.queryKey(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category");
    },
  })
);

// Usage
const handleCreate = (data) => createMutation.mutate(data);
const handleUpdate = (data) => updateMutation.mutate(data);
const handleDelete = (id) => deleteMutation.mutate({ id });
```

### Example 3: Form Integration with use-formedible

```tsx
// From apps/web/src/app/admin/components/new/page.tsx
const createMutation = useMutation(
  trpc.components.create.mutationOptions({
    onSuccess: (component) => {
      toast.success("Component created successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.components.getAll.queryKey(),
      });
      router.push(`/admin/components/${component.id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create component");
    },
  })
);

const { Form } = useFormedible({
  schema: createComponentSchema,
  formOptions: {
    defaultValues: { name: "", description: "" },
    onSubmit: async ({ value }) => {
      createMutation.mutate(value);
    },
  },
  loading: createMutation.isPending,
  submitLabel: "Create Component",
});
```

---

## 🚫 Common Mistakes - AVOID THESE

### ❌ Wrong Query Pattern

```tsx
// DON'T DO THIS
const { data } = trpc.users.getAll.useQuery();
```

### ❌ Wrong Mutation Pattern

```tsx
// DON'T DO THIS
const mutation = trpc.users.create.useMutation();
const mutation = useMutation({ mutationFn: trpc.users.create.mutate });
```

### ❌ Wrong Import

```tsx
// DON'T DO THIS
import { trpc } from "@trpc/react-query";
```

### ❌ Wrong Context Access

```tsx
// DON'T DO THIS
const utils = trpc.useUtils();
const utils = trpc.useContext();
```

---

## ✅ Key Points for Success

1. **Always use `useQuery(trpc.*.*.queryOptions())`** for queries
2. **Always use `useMutation(trpc.*.*.mutationOptions({}))`** for mutations
3. **Always import from `@tanstack/react-query`** not tRPC
4. **Always use `queryClient.invalidateQueries({ queryKey: trpc.*.*.queryKey() })`** for cache updates
5. **Access mutation state via `mutation.isPending`**, `mutation.isError`, etc.
6. **Use toast for user feedback** in onSuccess/onError callbacks
7. **Import trpc from `@/utils/trpc`** in this project

---

## 🎛️ Session & Authentication

### Getting Current Session

```tsx
// Available endpoint for session data
const { data: session, isLoading } = useQuery(trpc.getSession.queryOptions());

// Session structure:
// session?.user - user data if logged in
// session?.user?.role - user role (user/creator/admin)
```

### Protected Procedures

```ts
// Server-side - use these procedure types:
publicProcedure; // Anyone can access
protectedProcedure; // Requires authentication
adminProcedure; // Requires admin role
```

---

## 📁 Project Structure

```
apps/server/src/
├── routers/           # tRPC route definitions
│   ├── index.ts      # Main router with all sub-routers
│   ├── admin.ts      # Admin-only procedures
│   ├── users.ts      # User management
│   └── components.ts # Component CRUD
├── lib/
│   ├── trpc.ts       # tRPC setup & procedures
│   └── validation.ts # Zod schemas
└── db/schema/        # Database schemas

apps/web/src/
├── utils/trpc.ts     # tRPC client setup
└── app/              # Pages using tRPC
```

---

## 🔍 Debugging Tips

1. Check the **actual working examples** in the codebase first
2. Ensure you're using the **correct import paths**
3. Verify **queryClient** is properly imported and used
4. Check that **mutation/query options** are used correctly
5. Look at **server router** to ensure the procedure exists
6. Verify **Zod validation schemas** match the input data

**When in doubt, copy the exact patterns from working admin pages!**
