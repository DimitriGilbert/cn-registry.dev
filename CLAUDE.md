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
bun install                    # Install dependencies
bun db:push                   # Push schema to database (first time setup)
```

### Development

```bash
bun dev                       # Start both web and server in development
bun dev:web                   # Start only web app (port 3001)
bun dev:server                # Start only server (port 3000)
```

### Database Management

```bash
bun db:start                  # Start PostgreSQL with Docker Compose
bun db:stop                   # Stop PostgreSQL containers
bun db:down                   # Stop and remove PostgreSQL containers
bun db:studio                 # Open Drizzle Studio (database UI)
bun db:push                   # Push schema changes to database
bun db:generate               # Generate database migrations
bun db:migrate                # Run database migrations
```

### Code Quality

```bash
bun check                     # Run Biome linting and formatting
bun check-types               # TypeScript type checking across all apps
bun build                     # Build all applications
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
- **Components**: shadcn/ui with Radix UI primitives
- **Styling**: TailwindCSS v4 with custom configuration
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
2. **Concurrent Development**: Use `bun dev` to run both apps simultaneously
3. **API Development**: Server changes auto-restart, tRPC provides end-to-end type safety
4. **Schema Changes**: Use `bun db:generate` → `bun db:migrate` → `bun db:push` workflow
5. **Code Quality**: Run `bun check` before committing to ensure consistent formatting

## Key Files

- `turbo.json` - Monorepo task configuration
- `biome.json` - Linting and formatting rules
- `apps/server/src/routers/index.ts` - Main tRPC router
- `apps/web/src/utils/trpc.ts` - Frontend tRPC client setup
- `apps/server/src/db/schema/` - Database schema definitions

## Work Directives

- follow existing patterns
- if you encounter errors, look in docs/ you might find the answer there.
  - docs/llm/common-errors/index.md contains errors that are common and have been encountered by the LLM.
- if you encounter errors multiple times due to mis usage of a library, function, component, etc. your knowledge might be out of date. You will have to fetch the latest docs and update your knowledge.
  - once the error is fixed, update the docs/llm/common-errors/index.md with the new information. with reference to the source url if any and the concerned file.
- project must build when you are done
