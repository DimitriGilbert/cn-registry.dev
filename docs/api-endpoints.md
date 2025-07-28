# API Endpoints

This document outlines the main API endpoints provided by the tRPC server.

## tRPC Routers

The tRPC routers are defined in `apps/server/src/routers/`. The main router is `apps/server/src/routers/index.ts`, which combines all the other routers.

### Admin Router (`admin.ts`)

Handles administrative actions, such as managing users, components, and categories.

### Analytics Router (`analytics.ts`)

Provides endpoints for fetching analytics data.

### Categories Router (`categories.ts`)

Handles CRUD operations for categories.

### Components Router (`components.ts`)

Handles CRUD operations for components.

### Creators Router (`creators.ts`)

Handles fetching creator data.

### GitHub Router (`github.ts`)

Provides an endpoint for fetching data from the GitHub API.

### Projects Router (`projects.ts`)

Handles CRUD operations for projects.

### Themes Router (`themes.ts`)

Handles CRUD operations for themes.

### Tools Router (`tools.ts`)

Handles CRUD operations for tools.

### Users Router (`users.ts`)

Handles user-related actions, such as updating profiles.