# AI Assistant Guide: cn-registry

This guide provides a comprehensive overview of the `cn-registry` project for an AI assistant. Adhering to these guidelines is crucial for maintaining code quality, consistency, and correctness.

---

## 1. Project Overview & Goal

-   **Purpose:** `cn-registry` is a web application that allows developers to discover, share, and manage `shadcn/ui` components and related developer tools. It serves as a community-driven registry with features for searching, rating, and commenting on assets.
-   **Architecture:** The project is a TypeScript monorepo managed with `bun` and `Turborepo`. It consists of two main applications:
    -   `apps/web`: A Next.js frontend for the user-facing website and admin dashboard.
    -   `apps/server`: A tRPC server that provides the API for the frontend.
-   **Database:** The backend uses a PostgreSQL database with Drizzle ORM for data access.

---

## 2. Technology Stack & Key Libraries

-   **Package Manager:** This project uses `bun`. **Do not use `npm` or `yarn`**.
-   **Frontend:**
    -   Next.js (App Router)
    -   React
    -   Tailwind CSS
    -   `@tanstack/react-query` for data fetching and caching.
    -   `shadcn/ui` for UI components.
    -   `use-formedible` for schema-driven forms.
-   **Backend:**
    -   tRPC for the API layer.
    -   Drizzle ORM for database interaction.
    -   Zod for validation.
    -   Better Auth for authentication.

---

## 3. Development Workflow & Commands

-   **Installation:** `bun install`
-   **Running Locally:** `bun dev`
-   **Building for Production:** `bun build`
-   **Linting & Formatting:** `bun check` (This runs Biome, the project's linter and formatter).
-   **Database Migrations:** `bun db:generate` to generate migration files after schema changes, and `bun db:push` to apply them to the database.

---

## 4. Code Style & Conventions

-   **Formatting:** All code is formatted using Biome. Ensure you run `bun check` before committing.
-   **Naming Conventions:**
    -   **Components:** `PascalCase` (e.g., `UserProfile.tsx`).
    -   **Files/Folders:** `kebab-case` (e.g., `user-menu.tsx`).
    -   **Variables/Functions:** `camelCase` (e.g., `formatDate`).
-   **Commit Messages:** Follow the Conventional Commits specification (e.g., `feat: add user login page`).

---

## 5. Architectural Principles & Patterns

### Directory Structure

-   `apps/web/src/app`: Contains the Next.js pages and layouts.
-   `apps/web/src/components`: Contains reusable React components.
    -   `ui/`: For `shadcn/ui` components.
    -   `features/`: For more complex, feature-specific components.
    -   `layout/`: For layout-related components.
-   `apps/server/src/routers`: Contains the tRPC routers that define the API endpoints.
-   `apps/server/src/db/schema`: Contains the Drizzle ORM schema definitions.
-   `apps/server/src/lib`: Contains shared server-side utilities, including tRPC and validation logic.

### Data Flow

1.  **Schema:** Define the database table in `apps/server/src/db/schema/`.
2.  **tRPC Router:** Create procedures in a router within `apps/server/src/routers/` to expose the data.
3.  **Frontend Component:** Use the `useQuery` hook from `@tanstack/react-query` with the `trpc` client (`@/utils/trpc`) to fetch data in a client component.

### Styling

-   Use Tailwind CSS utility classes for all styling. Avoid writing custom CSS files.
-   Leverage `shadcn/ui` components and their variants whenever possible.

---

## 6. "Dos and Don'ts"

-   **DO:** Use the `trpc` client for all data fetching on the client side.
-   **DON'T:** Make direct database queries from the frontend.
-   **DO:** Define validation schemas using Zod in `apps/server/src/lib/validation.ts` for all tRPC inputs.
-   **DON'T:** Commit secrets or API keys. Use environment variables as defined in `.env.example`.
-   **DO:** Keep components small and focused on a single responsibility.
-   **DON'T:** Introduce new dependencies without a clear reason.

---

## 7. Examples

### Adding a New API Endpoint

1.  **Define Schema (`apps/server/src/lib/validation.ts`):**

    ```typescript
    export const createComponentSchema = z.object({
      name: z.string().min(3),
      description: z.string().min(10),
      // ...
    });
    ```

2.  **Create Router Procedure (`apps/server/src/routers/components.ts`):**

    ```typescript
    import { protectedProcedure, router } from "../lib/trpc";
    import { createComponentSchema } from "../lib/validation";
    import { components } from "../db/schema";

    export const componentsRouter = router({
      create: protectedProcedure
        .input(createComponentSchema)
        .mutation(async ({ ctx, input }) => {
          const [newComponent] = await db.insert(components).values({
            ...input,
            creatorId: ctx.user.id,
          }).returning();
          return newComponent;
        }),
    });
    ```

### Fetching Data in a Component

-   **File:** `apps/web/src/app/components/page.tsx`

    ```typescript
    "use client";

    import { useQuery } from "@tanstack/react-query";
    import { trpc } from "@/utils/trpc";

    export default function ComponentsPage() {
      const { data: componentsData, isLoading } = useQuery(
        trpc.components.getAll.queryOptions({ limit: 10, page: 1 })
      );

      if (isLoading) return <p>Loading...</p>;

      return (
        <div>
          {componentsData?.components.map((component) => (
            <div key={component.id}>{component.name}</div>
          ))}
        </div>
      );
    }
    ```