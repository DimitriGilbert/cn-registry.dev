# Scripts

This document provides an overview of the scripts in the `scripts/` directory.

-   **`clear-components.ts`**: A script to delete all components and their related data (categories, stars, ratings, comments, etc.) from the database.
-   **`import-components.ts`**: A script to bulk-import components from a JSON file. It can also create categories and a default admin user if they don't exist.
-   **`import-github-data.ts`**: A script to fetch data from the GitHub API for all components and tools that have a GitHub repository URL. It caches the data in the `githubCache` table.
-   **`make-admin.ts`**: A script to grant admin privileges to an existing user by their email address.
-   **`make-admin-prod.ts`**: A production-ready version of the `make-admin.ts` script that can be run in a Docker container.
