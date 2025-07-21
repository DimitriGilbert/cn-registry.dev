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

### Profile (`/profile`)

*   **File:** `apps/web/src/app/profile/page.tsx`
*   **Description:** User profile page where creators can update their information using schema-driven forms.

### Creator Profiles (`/creators`)

*   **File:** `apps/web/src/app/creators/page.tsx`
*   **Description:** Browse all creators and their public profiles.

### Creator Profile Detail (`/creators/[username]`)

*   **File:** `apps/web/src/app/creators/[username]/page.tsx`
*   **Description:** Public profile page showing a creator's components, tools, and information.

### Projects (`/projects`)

*   **File:** `apps/web/src/app/projects/page.tsx`
*   **Description:** Browse and manage user projects that organize components.

### Create Project (`/projects/new`)

*   **File:** `apps/web/src/app/projects/new/page.tsx`
*   **Description:** Create a new project to organize components and tools.

### Project Detail (`/projects/[slug]`)

*   **File:** `apps/web/src/app/projects/[slug]/page.tsx`
*   **Description:** View a project and its organized components.

### Edit Project (`/projects/[slug]/edit`)

*   **File:** `apps/web/src/app/projects/[slug]/edit/page.tsx`
*   **Description:** Edit project settings and information (owners/editors only).

### Suggest Component (`/suggest/component`)

*   **File:** `apps/web/src/app/suggest/component/page.tsx`
*   **Description:** Public form for users to suggest new components using the shared ItemForm.

## Admin Pages

### Admin Dashboard (`/admin`)

*   **File:** `apps/web/src/app/admin/page.tsx`
*   **Description:** The main dashboard for administrators, providing an overview of the platform's analytics and quick access to management features.

### Manage Components (`/admin/components`)

*   **File:** `apps/web/src/app/admin/components/page.tsx`
*   **Description:** A table view of all components, allowing admins to manage them.

### Create Component (`/admin/components/new`)

*   **File:** `apps/web/src/app/admin/components/new/page.tsx`
*   **Description:** A form for admins to create new components using the shared ItemForm.

### Edit Component (`/admin/components/[id]/edit`)

*   **File:** `apps/web/src/app/admin/components/[id]/edit/page.tsx`
*   **Description:** A form for admins to edit the details of a specific component.

### Component Analytics (`/admin/components/[id]/analytics`)

*   **File:** `apps/web/src/app/admin/components/[id]/analytics/page.tsx`
*   **Description:** Displays detailed analytics for a specific component.

### Manage Tools (`/admin/tools`)

*   **File:** `apps/web/src/app/admin/tools/page.tsx`
*   **Description:** A table view of all tools, allowing admins to manage them.

### Create Tool (`/admin/tools/new`)

*   **File:** `apps/web/src/app/admin/tools/new/page.tsx`
*   **Description:** A form for admins to create new tools using the shared ItemForm.

### Edit Tool (`/admin/tools/[id]/edit`)

*   **File:** `apps/web/src/app/admin/tools/[id]/edit/page.tsx`
*   **Description:** A form for admins to edit the details of a specific tool.

### Tool Analytics (`/admin/tools/[id]/analytics`)

*   **File:** `apps/web/src/app/admin/tools/[id]/analytics/page.tsx`
*   **Description:** Displays detailed analytics for a specific tool.

### Manage Categories (`/admin/categories`)

*   **File:** `apps/web/src/app/admin/categories/page.tsx`
*   **Description:** A page for admins to create, edit, and delete categories with full CRUD operations.

### Manage Users (`/admin/users`)

*   **File:** `apps/web/src/app/admin/users/page.tsx`
*   **Description:** A page for admins to manage users, update roles, and suspend accounts.

### Admin Notifications (`/admin/notifications`)

*   **File:** `apps/web/src/app/admin/notifications/page.tsx`
*   **Description:** A page for admins to create, read, and manage system notifications.

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
