# Database Schema

This document provides a detailed overview of the database schema for cn-registry. The schema is designed to support all the features of the application, from content management to user engagement and analytics.

## Schema Files

The database schema is defined in the `apps/server/src/db/schema/` directory. Each file corresponds to a table or a set of related tables in the database:

-   `admin.ts`: Admin-related tables.
-   `analytics.ts`: Analytics tables.
-   `auth.ts`: Authentication-related tables from Better Auth.
-   `content.ts`: Core content tables like `components`, `tools`, and `categories`.
-   `engagement.ts`: User engagement tables like `stars`, `ratings`, and `comments`.
-   `index.ts`: Exports all schemas.
-   `themes.ts`: Theme-related tables.
-   `users.ts.bak`: A backup file, needs investigation.

## Core Tables

### `user`

Stores user information.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `text` | **Primary Key.** The user's unique ID. |
| `name` | `text` | The user's name. |
| `email` | `text` | The user's email address (unique). |
| `emailVerified` | `boolean` | Whether the user's email has been verified. |
| `image` | `text` | URL to the user's profile image. |
| `username` | `text` | The user's unique username. |
| `role` | `text` | The user's role (`user`, `creator`, `admin`). Defaults to `user`. |
| `bio` | `text` | The user's bio/description. |
| `website` | `text` | URL to the user's website. |
| `location` | `text` | The user's location. |
| `company` | `text` | The user's company. |
| `socialLinks` | `jsonb` | Social media links (GitHub, Twitter, etc.). |
| `verified` | `boolean` | Whether the user is verified. |
| `specialties` | `text[]` | Array of user's specialties/skills. |
| `createdAt` | `timestamp` | The timestamp when the user was created. |
| `updatedAt` | `timestamp` | The timestamp when the user was last updated. |

### `components`

Stores information about shared components.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key.** The component's unique ID. |
| `name` | `text` | The component's name (unique). |
| `description` | `text` | A description of the component. |
| `repoUrl` | `text` | URL to the component's repository. |
| `websiteUrl` | `text` | URL to the component's live demo or documentation. |
| `installUrl` | `text` | URL to the component's installation guide. |
| `installCommand`| `text` | The command to install the component. |
| `tags` | `text[]` | An array of tags for the component. |
| `status` | `text` | The component's status (`published`, `draft`, `archived`, `suggested`). Defaults to `published`. |
| `creatorId` | `text` | **Foreign Key** to `user.id`. The ID of the user who created the component. |
| `createdAt` | `timestamp` | The timestamp when the component was created. |
| `updatedAt` | `timestamp` | The timestamp when the component was last updated. |

### `tools`

Stores information about shared tools.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key.** The tool's unique ID. |
| `name` | `text` | The tool's name (unique). |
| `description` | `text` | A description of the tool. |
| `repoUrl` | `text` | URL to the tool's repository. |
| `websiteUrl` | `text` | URL to the tool's live demo or documentation. |
| `installUrl` | `text` | URL to the tool's installation guide. |
| `installCommand`| `text` | The command to install the tool. |
| `tags` | `text[]` | An array of tags for the tool. |
| `status` | `text` | The tool's status (`published`, `draft`, `archived`, `suggested`). Defaults to `published`. |
| `creatorId` | `text` | **Foreign Key** to `user.id`. The ID of the user who created the tool. |
| `createdAt` | `timestamp` | The timestamp when the tool was created. |
| `updatedAt` | `timestamp` | The timestamp when the tool was last updated. |

### `categories`

Stores categories for components and tools.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key.** The category's unique ID. |
| `name` | `text` | The category's name (unique). |

### `component_categories`

Junction table linking components to categories.

| Column | Type | Description |
| :--- | :--- | :--- |
| `componentId` | `uuid` | **Primary Key.** **Foreign Key** to `components.id`. |
| `categoryId` | `uuid` | **Primary Key.** **Foreign Key** to `categories.id`. |

### `tool_categories`

Junction table linking tools to categories.

| Column | Type | Description |
| :--- | :--- | :--- |
| `toolId` | `uuid` | **Primary Key.** **Foreign Key** to `tools.id`. |
| `categoryId` | `uuid` | **Primary Key.** **Foreign Key** to `categories.id`. |

### `projects`

Stores user projects that organize components.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key.** The project's unique ID. |
| `name` | `text` | The project's name. |
| `description` | `text` | The project's description. |
| `slug` | `text` | The project's unique slug (unique). |
| `userId` | `text` | **Foreign Key** to `user.id`. The project owner. |
| `visibility` | `text` | The project's visibility (`private`, `public`). Defaults to `private`. |
| `createdAt` | `timestamp` | The timestamp when the project was created. |
| `updatedAt` | `timestamp` | The timestamp when the project was last updated. |

### `project_components`

Junction table linking projects to components.

| Column | Type | Description |
| :--- | :--- | :--- |
| `projectId` | `uuid` | **Primary Key.** **Foreign Key** to `projects.id`. |
| `componentId` | `uuid` | **Primary Key.** **Foreign Key** to `components.id`. |
| `addedAt` | `timestamp` | The timestamp when the component was added to the project. |

### `project_collaborators`

Stores project collaborators and their roles.

| Column | Type | Description |
| :--- | :--- | :--- |
| `projectId` | `uuid` | **Primary Key.** **Foreign Key** to `projects.id`. |
| `userId` | `text` | **Primary Key.** **Foreign Key** to `user.id`. |
| `role` | `text` | The collaborator's role (`owner`, `editor`, `viewer`). Defaults to `viewer`. |
| `addedAt` | `timestamp` | The timestamp when the collaborator was added. |

### `github_cache`

Caches GitHub repository data to reduce API calls.

| Column | Type | Description |
| :--- | :--- | :--- |
| `repoUrl` | `text` | **Primary Key.** The GitHub repository URL. |
| `data` | `text` | The cached repository data (JSON string). |
| `lastFetched` | `timestamp` | The timestamp when the data was last fetched. |
| `expiresAt` | `timestamp` | The timestamp when the cache expires. |

### `user_settings`

Stores user-specific settings and preferences.

| Column | Type | Description |
| :--- | :--- | :--- |
| `userId` | `text` | **Primary Key.** **Foreign Key** to `user.id`. |
| `theme` | `text` | The user's preferred theme. |
| `notifications` | `jsonb` | Notification preferences. |
| `locale` | `text` | The user's preferred locale. |

## Engagement Tables

### `stars`

Stores user stars for components and tools.

| Column | Type | Description |
| :--- | :--- | :--- |
| `userId` | `text` | **Primary Key.** **Foreign Key** to `user.id`. |
| `itemType` | `text` | **Primary Key.** The type of item being starred (`component` or `tool`). |
| `itemId` | `uuid` | **Primary Key.** The ID of the item being starred. |
| `starredAt` | `timestamp` | The timestamp when the item was starred. |

### `ratings`

Stores user ratings for components and tools.

| Column | Type | Description |
| :--- | :--- | :--- |
| `userId` | `text` | **Primary Key.** **Foreign Key** to `user.id`. |
| `itemType` | `text` | **Primary Key.** The type of item being rated (`component` or `tool`). |
| `itemId` | `uuid` | **Primary Key.** The ID of the item being rated. |
| `rating` | `smallint` | The rating value (1-5). |
| `ratedAt` | `timestamp` | The timestamp when the item was rated. |

### `comments`

Stores user comments for components and tools.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key.** The comment's unique ID. |
| `userId` | `text` | **Foreign Key** to `user.id`. |
| `itemType` | `text` | The type of item being commented on (`component` or `tool`). |
| `itemId` | `uuid` | The ID of the item being commented on. |
| `parentId` | `uuid` | The ID of the parent comment for threaded comments. |
| `content` | `text` | The content of the comment. |
| `createdAt` | `timestamp` | The timestamp when the comment was created. |

## Other Tables

### `themes`

Stores theme configurations.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key.** The theme's unique ID. |
| `name` | `text` | The theme's name (unique). |
| `tokens` | `jsonb` | The theme's design tokens. |
| `createdBy` | `text` | **Foreign Key** to `user.id`. The ID of the user who created the theme. |
| `isDefault` | `boolean` | Whether the theme is the default theme. Defaults to `false`. |
| `createdAt` | `timestamp` | The timestamp when the theme was created. |

### `edits_log`

Stores a log of edits made to components and tools.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigserial` | **Primary Key.** The log entry's unique ID. |
| `itemType` | `text` | The type of item that was edited (`component` or `tool`). |
| `itemId` | `uuid` | The ID of the item that was edited. |
| `editorId` | `text` | **Foreign Key** to `user.id`. The ID of the user who made the edit. |
| `changes` | `jsonb` | The changes that were made. |
| `editedAt` | `timestamp` | The timestamp when the edit was made. |

### `admin_notifications`

Stores notifications for admins.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key.** The notification's unique ID. |
| `title` | `text` | The notification title. |
| `message` | `text` | The notification message. |
| `type` | `text` | The notification type (`info`, `warning`, `error`, `success`). Defaults to `info`. |
| `isRead` | `boolean` | Whether the notification has been read. Defaults to `false`. |
| `createdAt` | `timestamp` | The timestamp when the notification was created. |

### `analytics_events`

Stores analytics events.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigserial` | **Primary Key.** The event's unique ID. |
| `eventType` | `text` | The type of event (`view`, `install`, `star`, `comment`). |
| `itemType` | `text` | The type of item the event is for (`component` or `tool`). |
| `itemId` | `uuid` | The ID of the item the event is for. |
| `userId` | `text` | **Foreign Key** to `user.id`. The ID of the user who triggered the event. |
| `createdAt` | `timestamp` | The timestamp when the event was created. |

### `counters_cache`

Stores cached counts for analytics.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigserial` | **Primary Key.** The cache entry's unique ID. |
| `date` | `date` | The date for which the counts are cached. |
| `itemType` | `text` | The type of item the counts are for (`component` or `tool`). |
| `itemId` | `uuid` | The ID of the item the counts are for. |
| `viewsCount` | `integer` | The number of views for the item on the given date. |
| `installsCount` | `integer` | The number of installs for the item on the given date. |
| `starsCount` | `integer` | The number of stars for the item on the given date. |
| `commentsCount` | `integer` | The number of comments for the item on the given date. |
