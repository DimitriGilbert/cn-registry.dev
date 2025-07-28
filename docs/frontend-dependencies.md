# Frontend Dependencies

This document outlines the key dependencies for the web application.

## `package.json`

The `apps/web/package.json` file lists the frontend application's dependencies. Key libraries include:

-   **Framework**: Next.js
-   **UI**: React
-   **Styling**: Tailwind CSS
-   **Components**: shadcn/ui
-   **API Communication**: tRPC Client
-   **Forms**: TanStack Form

## `components.json`

This file, located at `apps/web/components.json`, is used by the `shadcn/ui` CLI to manage component configuration, such as the location of utils and UI components.

## `tweakcn-registry.json`

This file, located at `apps/web/public/tweakcn-registry.json`, appears to be a static data source for the component registry. It likely contains the initial or fallback data for the components displayed in the application.
