# Development Guide

This guide covers the essential information for developers working on the cn-registry project.

## Quick Start

1. **Prerequisites**: Bun, PostgreSQL, Docker (for database)
2. **Setup**: Run `bun install` from project root
3. **Database**: Start with `bun run db:start` then `bun run db:push`
4. **Development**: Run `bun run dev` to start both apps

## Project Structure

```
cn-registry/
├── apps/
│   ├── web/          # Next.js frontend (port 3002)
│   └── server/       # Next.js API backend (port 3000)
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── packages/         # Shared packages (if any)
```

## Key Technologies

- **Monorepo**: Turborepo (configured in `turbo.json`)

- **Runtime**: Bun (package manager + runtime)
- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API with tRPC 11
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (session-based)
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Forms**: TanStack Form + use-formedible (schema-driven)
- **State**: TanStack React Query

## Development Workflow

### Database Changes
1. Update schema in `apps/server/src/db/schema/`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:migrate` to apply migration
4. Run `bun run db:push` to sync with database

### Code Quality
- **Build**: `bun run build` (checks TypeScript + builds)
- **Linting**: `bun run check` (Biome formatting)
- **Types**: `bun run check-types` (TypeScript validation)

### Environment Setup
- Server env: `apps/server/.env`
- Web env: `apps/web/.env`
- Required vars documented in CLAUDE.md

## Common Tasks

### Creating Forms
Always use `use-formedible` with schema-driven approach:

```tsx
import { useFormedible } from "@/hooks/use-formedible";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

const { Form } = useFormedible({
  schema,
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      placeholder: "Enter name",
    },
  ],
  formOptions: {
    onSubmit: async ({ value }) => {
      // Handle submission
    },
  },
});
```

### Using tRPC
Follow the patterns in `docs/llm/trpc.md`:

```tsx
// Queries
const { data } = useQuery(
  trpc.components.getAll.queryOptions({ page: 1 })
);

// Mutations
const mutation = useMutation(
  trpc.components.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.components.getAll.queryKey(),
      });
    },
  })
);
```

### Admin Security
All admin pages are protected by:
- `apps/web/src/app/admin/layout.tsx` - Role checking
- Server procedures use `adminProcedure` for backend protection

### Performance Guidelines
- Use `useMemo` for expensive computations in forms
- Memoize field configurations to prevent re-renders
- Use proper tRPC query invalidation patterns

## Debugging

### Common Issues
1. **Form CPU spikes**: Check for unmemoized field configurations
2. **tRPC errors**: Verify procedure types and imports
3. **Build failures**: Run `bun run check-types` for TypeScript issues
4. **Database issues**: Check connection in `apps/server/.env`

### Useful Commands
```bash
# Database management
bun run db:studio     # Open Drizzle Studio
bun run db:start      # Start PostgreSQL
bun run db:push       # Sync schema changes

# Development
bun run dev           # Start both apps
bun run build         # Build everything
bun run check         # Lint and format

# Admin tools
bun scripts/make-admin.ts <email>  # Make user admin
bun scripts/import-components.ts <file>  # Import components
```

## Architecture Decisions

### Forms
- **Why use-formedible**: Provides schema-driven forms with consistent validation
- **Performance**: Memoized configurations prevent re-renders
- **Reusability**: Shared `ItemForm` for components and tools

### Security
- **Session-based auth**: More secure than JWT for this use case
- **Role-based access**: Three levels (user, creator, admin)
- **Route protection**: Layout-level and procedure-level checks

### Database
- **Drizzle ORM**: Type-safe, performant, good migrations
- **PostgreSQL**: Reliable, supports JSONB, full-text search
- **Schema organization**: Logical separation by domain

## Contributing

1. Follow existing patterns in the codebase
2. Use schema-driven forms (never custom forms)
3. Follow tRPC v11 patterns exactly as documented
4. Ensure builds pass before committing
5. Update documentation when adding features