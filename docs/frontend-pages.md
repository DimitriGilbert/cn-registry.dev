# Frontend Pages

This document provides an overview of the frontend pages in the cn-registry application, based on the files in `apps/web/src/app`.

## Core Pages

### Home (`/`)
- **File:** `apps/web/src/app/page.tsx`
- **Description:** The main landing page. It displays an alpha version warning, a hero section with a search bar, and several "Collection Sections" for latest components, popular components, and featured tools. It also includes a "Why this exists" section explaining the project's motivation.

### Components (`/components`)
- **File:** `apps/web/src/app/components/page.tsx`
- **Description:** Displays a paginated grid of all available components. Features a search bar and filter panel allowing users to filter by category and sort by latest, stars, downloads, or name.

### Component Detail (`/components/[id]`)
- **File:** `apps/web/src/app/components/[id]/page.tsx`
- **Description:** Shows the details for a single component. It includes a breadcrumb, page title with description, action buttons (Star, Add to Cart, GitHub, Demo), and a tabbed view for README, examples (`Showcase`), and comments. It also displays installation commands and creator information.

### Tools (`/tools`)
- **File:** `apps/web/src/app/tools/page.tsx`
- **Description:** Similar to the components page, but for developer tools. Displays a paginated grid with search and filtering capabilities.

### Tool Detail (`/tools/[id]`)
- **File:** `apps/web/src/app/tools/[id]/page.tsx`
- **Description:** The detail page for a single tool, mirroring the component detail page's structure with information, README, examples, and comments.

### Search (`/search`)
- **File:** `apps/web/src/app/search/page.tsx`
- **Description:** A dedicated search page with tabs for "Components" and "Tools". It allows users to search across the entire registry and filter the results.

## User & Creator Pages

### Login (`/login`)
- **File:** `apps/web/src/app/login/page.tsx`
- **Description:** A simple page that toggles between the `SignInForm` and `SignUpForm` components.

### Dashboard (`/dashboard`)
- **File:** `apps/web/src/app/dashboard/page.tsx`
- **Description:** The user's personal dashboard. It shows statistics like starred components/tools, comments, and downloads. It also displays lists of starred items and recent user activity.

### Profile (`/profile`)
- **File:** `apps/web/src/app/profile/page.tsx`
- **Description:** Allows users to view and edit their public creator profile. The form, driven by `useFormedible`, allows updating bio, website, location, social links, and specialties.

### Creators (`/creators`)
- **File:** `apps/web/src/app/creators/page.tsx`
- **Description:** A page to discover creators. It has a "Trending" tab and a "Search" tab to find creators by name.

### Creator Profile (`/creators/[username]`)
- **File:** `apps/web/src/app/creators/[username]/page.tsx`
- **Description:** The public profile page for a single creator. It displays their bio, stats, social links, and tabs for their published components and projects.

## Project Pages

### Projects (`/projects`)
- **File:** `apps/web/src/app/projects/page.tsx`
- **Description:** Lists all the user's projects, showing stats like component and collaborator counts.

### New Project (`/projects/new`)
- **File:** `apps/web/src/app/projects/new/page.tsx`
- **Description:** A form page for creating a new project, allowing the user to set a name, description, and visibility (public/private).

### Project Detail (`/projects/[slug]`)
- **File:** `apps/web/src/app/projects/[slug]/page.tsx`
- **Description:** Displays the contents of a specific project. It has tabs for viewing the components in the project and managing collaborators. It also includes an "Export" feature to generate installation configs.

### Edit Project (`/projects/[slug]/edit`)
- **File:** `apps/web/src/app/projects/[slug]/edit/page.tsx`
- **Description:** A form page for editing an existing project's details, including its name, description, and visibility.

## Admin Pages

The admin section is protected by `apps/web/src/app/admin/layout.tsx`, which checks for an admin user role.

### Admin Dashboard (`/admin`)
- **File:** `apps/web/src/app/admin/page.tsx`
- **Description:** The main dashboard for administrators, showing platform-wide statistics, analytics charts, and recent notifications.

### Manage Components (`/admin/components`)
- **File:** `apps/web/src/app/admin/components/page.tsx`
- **Description:** A paginated table view of all components, allowing admins to search, filter, and perform actions like editing, viewing analytics, refreshing GitHub data, or deleting.

### New/Edit Component (`/admin/components/new`, `/admin/components/[id]/edit`)
- **Files:** `.../new/page.tsx`, `.../[id]/edit/page.tsx`
- **Description:** Form pages for creating and editing components. The edit page also includes a section to load and display data from GitHub.

### Component Analytics (`/admin/components/[id]/analytics`)
- **File:** `.../[id]/analytics/page.tsx`
- **Description:** Displays detailed analytics for a specific component, including KPIs, time-series charts for views/installs, traffic source distribution, and top engaged users.

### Manage Tools (`/admin/tools`, etc.)
- **Description:** The admin pages for tools mirror the structure of the component management pages, providing full CRUD and analytics functionality for tools.

### Manage Categories (`/admin/categories`)
- **File:** `apps/web/src/app/admin/categories/page.tsx`
- **Description:** Provides full CRUD functionality for managing component and tool categories in a table view.

### Manage Users (`/admin/users`)
- **File:** `apps/web/src/app/admin/users/page.tsx`
- **Description:** A table for managing users. Admins can search, filter by role, and update user roles or suspend users.

### Manage Notifications (`/admin/notifications`)
- **File:** `apps/web/src/app/admin/notifications/page.tsx`
- **Description:** Allows admins to create and manage system-wide notifications that appear on the admin dashboard.

### Manage Themes (`/admin/themes`)
- **File:** `apps/web/src/app/admin/themes/page.tsx`
- **Description:** A page for creating and managing theme configurations for the registry.

### Import (`/admin/import`)
- **File:** `apps/web/src/app/admin/import/page.tsx`
- **Description:** A utility page for bulk-importing components from a JSON file or pasted JSON content.

## Other Pages

### AI Chat (`/ai`)
- **File:** `apps/web/src/app/ai/page.tsx`
- **Description:** A simple chat interface that communicates with a backend AI service.

### Maintenance (`/maintenance`)
- **File:** `apps/web/src/app/maintenance/page.tsx`
- **Description:** A static page to display when the site is down for maintenance.

### Error Handling
- **`error.tsx`:** A client-side error boundary for the application.
- **`not-found.tsx`:** A custom 404 page.
- **`loading.tsx`:** A null-rendering loading component, suggesting loading states are handled within pages.