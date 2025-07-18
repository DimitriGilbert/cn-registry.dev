# Future Features & Improvements

This document outlines potential new features and improvements to enhance the `cn-registry` platform. The goal is to increase community engagement, provide more value to creators, and improve the overall user experience.

---

### 1. Component Installation Cart

**Why:** To streamline the process of installing multiple components, users should be able to add components to a "cart" and then generate a single `registry.json` file for all of them at once. This avoids repetitive manual configuration and makes setting up a new project with multiple components much faster.

**How:**

1.  **State Management (Client-side):**
    *   Create a `CartProvider` using React Context (`apps/web/src/components/cart-provider.tsx`) to manage the cart state globally.
    *   The context will expose `cart` (an array of component objects), `addToCart`, `removeFromCart`, `clearCart`, and `isInCart` functions.
    *   Wrap the root layout in `apps/web/src/app/layout.tsx` with this `CartProvider`.

2.  **UI Components:**
    *   **Add/Remove Button:** On the `ComponentCard` and the component detail page (`/components/[id]`), add a button that dynamically shows "Add to Cart" or "Remove from Cart" based on the `isInCart` status.
    *   **Cart Popover:** Create a new `Cart` component (`apps/web/src/components/cart.tsx`) and add it to the main `Header`.
        *   It will display a `ShoppingCart` icon with a badge indicating the number of items.
        *   Clicking the icon will open a `Popover` that lists the components in the cart, with a button to remove each one.
        *   The popover will contain a "Clear Cart" button and a "Generate Install File" button.

3.  **Backend API Endpoint:**
    *   Create a new tRPC procedure in `apps/server/src/routers/components.ts` named `getByIds`.
    *   This procedure will accept an array of component IDs (`string[]`).
    *   It will query the database and return the full details for all requested components in a single network request.

4.  **File Generation:**
    *   The "Generate Install File" button in the `Cart` popover will trigger a function.
    *   This function will call the `getByIds` tRPC procedure with the IDs of the components in the cart.
    *   Using the fetched component data, it will construct a `registry.json` object in the format specified by the shadcn/ui documentation.
    *   It will then use `Blob` and `URL.createObjectURL` to generate a downloadable `.json` file directly in the user's browser.

---

### 2. Interactive Component Previews

**Why:** The current component preview is static. A live, interactive sandbox (like CodeSandbox or StackBlitz) would allow users to experiment with components directly on the detail page, dramatically improving the evaluation experience.

**How:**
*   Integrate a sandboxing library like `@codesandbox/sandpack-react`.
*   Modify the `CodePreview` component (`apps/web/src/components/features/component-preview.tsx`) to use this library.
*   Extend the `components` schema (`apps/server/src/db/schema/content.ts`) to include fields for example code, dependencies, and preview configuration.
*   Update the component submission form to allow creators to add this information.

---

### 3. Full GitHub Integration

**Why:** The platform currently only stores a `repoUrl`. Automatically fetching READMEs, release notes, and key stats (issues, forks, license) from GitHub would enrich the content, keep it up-to-date, and save creators manual effort.

**How:**
*   Create a new tRPC procedure (e.g., in `apps/server/src/routers/components.ts`) that uses the GitHub API (e.g., via Octokit) to fetch data for a given repository URL.
*   Implement a caching mechanism (e.g., using Redis or a database table) to avoid hitting GitHub API rate limits.
*   On the component detail page (`apps/web/src/app/components/[id]/page.tsx`), call this new procedure and render the fetched README content (using a Markdown renderer) and stats.
*   Consider a periodic background job to refresh the cached data for all components.

---

### 4. User-Facing Notifications

**Why:** The current notification system is admin-only. A user-facing system would boost engagement by alerting creators when someone stars or comments on their work, or when a comment they made receives a reply.

**How:**
*   Create a new `user_notifications` table in the database, similar to `admin_notifications` but linked to a `userId`.
*   Update the `comments` and `stars` tRPC procedures to generate notifications for the component/tool creator.
*   Add a notification icon and panel to the main application header (`apps/web/src/components/header.tsx`).
*   Create a dedicated page (`/notifications`) for users to view their full notification history.

---

### 5. Component & Tool Versioning

**Why:** A registry needs to support multiple versions of a component or tool. This allows creators to publish updates without breaking projects that rely on older versions and lets users browse documentation for a specific version.

**How:**
*   Introduce a `versions` table to the database schema, linked to the `components` and `tools` tables. Each entry would have a version number (e.g., `1.2.0`), release notes, and pointers to version-specific metadata (like `installCommand` or `readmeContent`).
*   The main `components`/`tools` entry would point to the `latest` version.
*   Update the UI on the detail pages to include a version selector dropdown.
*   Modify the submission and update process to handle versioning.

---

### 6. Enhanced Creator Profiles

**Why:** Creators are the lifeblood of the registry. Giving them public profiles to showcase all their submitted components and tools would recognize their contributions and allow users to discover more great work from creators they like.

**How:**
*   Create a new public page at `/[username]` or `/creators/[username]`.
*   This page would fetch all components and tools associated with the user's `creatorId`.
*   Add more fields to the `user` schema for social links (GitHub, Twitter, etc.) and a bio, and display them on the profile page.
*   Link to these profiles from component/tool detail pages.
