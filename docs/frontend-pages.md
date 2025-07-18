# Frontend Pages

This document provides an overview of the frontend pages in the cn-registry application.

## Core Pages

### Home (`/`)

*   **File:** `apps/web/src/app/page.tsx`
*   **Description:** The landing page of the application. It showcases the latest and most popular components and tools, and provides a search bar for users to find what they need.

### Components (`/components`)

*   **File:** `apps/web/src/app/components/page.tsx`
*   **Description:** Displays a grid of all available components. Users can search, filter by category, and sort the components.

### Component Detail (`/components/[id]`)

*   **File:** `apps/web/src/app/components/[id]/page.tsx`
*   **Description:** Shows the details of a specific component, including a live preview, README, installation command, and community engagement features like starring, rating, and commenting.

### Tools (`/tools`)

*   **File:** `apps/web/src/app/tools/page.tsx`
*   **Description:** Displays a grid of all available tools. Users can search, filter by category, and sort the tools.

### Tool Detail (`/tools/[id]`)

*   **File:** `apps/web/src/app/tools/[id]/page.tsx`
*   **Description:** Shows the details of a specific tool, including its documentation, installation command, and community engagement features.

### Search (`/search`)

*   **File:** `apps/web/src/app/search/page.tsx`
*   **Description:** A dedicated search page that allows users to search for both components and tools, with filtering options.

## User Pages

### Login (`/login`)

*   **File:** `apps/web/src/app/login/page.tsx`
*   **Description:** The login and sign-up page for users to create an account or sign in.

### Dashboard (`/dashboard`)

*   **File:** `apps/web/src/app/dashboard/page.tsx`
*   **Description:** The user's personal dashboard, showing their starred components and tools, recent activity, and other stats.

## Admin Pages

### Admin Dashboard (`/admin`)

*   **File:** `apps/web/src/app/admin/page.tsx`
*   **Description:** The main dashboard for administrators, providing an overview of the platform's analytics and quick access to management features.

### Manage Components (`/admin/components`)

*   **File:** `apps/web/src/app/admin/components/page.tsx`
*   **Description:** A table view of all components, allowing admins to manage them.

### Edit Component (`/admin/components/[id]/edit`)

*   **File:** `apps/web/src/app/admin/components/[id]/edit/page.tsx`
*   **Description:** A form for admins to edit the details of a specific component.

### Component Analytics (`/admin/components/[id]/analytics`)

*   **File:** `apps/web/src/app/admin/components/[id]/analytics/page.tsx`
*   **Description:** Displays detailed analytics for a specific component.

### Manage Tools (`/admin/tools`)

*   **File:** `apps/web/src/app/admin/tools/page.tsx`
*   **Description:** A table view of all tools, allowing admins to manage them.

### Manage Themes (`/admin/themes`)

*   **File:** `apps/web/src/app/admin/themes/page.tsx`
*   **Description:** A page for admins to create and manage themes.

## Other Pages

### AI Chat (`/ai`)

*   **File:** `apps/web/src/app/ai/page.tsx`
*   **Description:** A chat interface for interacting with an AI assistant.

### Maintenance (`/maintenance`)

*   **File:** `apps/web/src/app/maintenance/page.tsx`
*   **Description:** A page to display when the site is under maintenance.

### Not Found (`/404`)

*   **File:** `apps/web/src/app/not-found.tsx`
*   **Description:** The page displayed when a user navigates to a non-existent URL.
