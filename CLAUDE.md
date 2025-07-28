# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo built with Turborepo containing a component registry application. The project consists of:

- **Web App** (`apps/web`): Next.js frontend running on port 3001
- **Server App** (`apps/server`): Next.js backend API with tRPC running on port 3000
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with session-based authentication

## Development Commands

### Setup

```bash
bun run install                    # Install dependencies
bun run db:push                   # Push schema to database (first time setup)
```

### Database Management

```bash
bun run db:start                  # Start PostgreSQL with Docker Compose
bun run db:stop                   # Stop PostgreSQL containers
bun run db:down                   # Stop and remove PostgreSQL containers
bun run db:studio                 # Open Drizzle Studio (database UI)
bun run db:push                   # Push schema changes to database
bun run db:generate               # Generate database migrations
bun run db:migrate                # Run database migrations
```

### Code Quality

```bash
bun run check                     # Run Biome linting and formatting
bun run check-types               # TypeScript type checking across all apps
bun run build                     # Build all applications
```

## Architecture

### Monorepo Structure

- Uses Turborepo for build orchestration and caching
- Bun as the runtime and package manager
- Biome for linting/formatting (tab indentation, double quotes)

### Database Layer

- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Located in `apps/server/src/db/schema/`
- **Configuration**: `apps/server/drizzle.config.ts`
- **Connection**: Uses `DATABASE_URL` environment variable

### API Layer (tRPC)

- **Server Setup**: `apps/server/src/lib/trpc.ts`
- **Routers**: `apps/server/src/routers/`
- **Context**: `apps/server/src/lib/context.ts` (handles session/auth)
- **Procedures**: `publicProcedure` and `protectedProcedure`

### Frontend (Web App)

- **tRPC Client**: `apps/web/src/utils/trpc.ts`
- **Components**: shadcn/ui with Shadcn UI primitives
- **Styling**: TailwindCSS v4
- **State**: React Query for server state, React forms with TanStack Form
- **Theme**: next-themes for dark/light mode support

### Authentication

- **Provider**: Better Auth
- **Schema**: `apps/server/src/db/schema/auth.ts` (user, session, account, verification tables)
- **Configuration**: `apps/server/src/lib/auth.ts`
- **Session Management**: Cookie-based sessions with CSRF protection

## Environment Configuration

Required environment files:

- `apps/server/.env` - Database URL and auth secrets
- `apps/web/.env` - API endpoint configuration

Key environment variables:

- `DATABASE_URL` (server)
- `NEXT_PUBLIC_SERVER_URL` (web) - Points to server app for tRPC calls

## Development Workflow

1. **Database First**: Set up PostgreSQL and run `bun db:push` before starting development
2. **API Development**: Server changes auto-restart, tRPC provides end-to-end type safety
3. **Schema Changes**: Use `bun db:generate` → `bun db:migrate` → `bun db:push` workflow
4. **Code Quality**: Run `bun check` before committing to ensure consistent formatting

- follow existing patterns
- if you encounter errors, look in docs/ you might find the answer there.
  - docs/llm/common-errors/index.md contains errors that are common and have been encountered by the LLM.
- if you encounter errors multiple times due to mis usage of a library, function, component, etc. your knowledge might be out of date. You will have to fetch the latest docs and update your knowledge.
  - once the error is fixed, update the docs/llm/common-errors/index.md with the new information. with reference to the source url if any and the concerned file.
- project must build when you are done
- use use-formedible for all the forms docs/llm/formedible.llm.txt
- we use trpc 11 and you knowledege is outdated, check existing example to not create bad code ! docs/llm/trpc.md
- always work from the root directory !
- NEVER USE EITHER CONFIRM NOR ALERTS ! THESE ARE ANTIPATTERNS !

## Key Files

- `apps/server/src/routers/index.ts` - Main tRPC router
- `apps/web/src/utils/trpc.ts` - Frontend tRPC client setup
- `apps/server/src/db/schema/` - Database schema definitions
