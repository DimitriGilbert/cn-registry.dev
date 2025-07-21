# API Endpoints

This document outlines the API endpoints for the cn-registry application, which are built using tRPC. These endpoints are consumed by the frontend to interact with the backend services.

## Admin Endpoints (`/admin`)

*   `getDashboard`: Retrieves statistics for the admin dashboard.
*   `getNotifications`: Fetches all admin notifications.
*   `createNotification`: Creates a new admin notification with title, message, and type.
*   `markNotificationAsRead`: Marks a specific notification as read.
*   `markAllNotificationsAsRead`: Marks all notifications as read.
*   `deleteNotification`: Deletes a notification.
*   `getEditHistory`: Retrieves the history of edits made to components and tools.
*   `getUsersForManagement`: Fetches a list of users for management purposes.
*   `updateUserRole`: Updates a user's role (user/creator/admin).
*   `suspendUser`: Suspends or unsuspends a user account.

## Analytics Endpoints (`/analytics`)

*   `trackEvent`: Tracks an analytics event.
*   `getTrending`: Retrieves trending components and tools.
*   `getSummary`: Fetches a summary of analytics data for administrators.
*   `getItemAnalytics`: Retrieves detailed analytics for a specific item.
*   `getComponentAnalytics`: Fetches detailed analytics for a specific component.
*   `getToolAnalytics`: Retrieves detailed analytics for a specific tool.

## Categories Endpoints (`/categories`)

*   `getAll`: Fetches all categories with their component and tool counts.
*   `getById`: Retrieves a specific category by its ID.
*   `create`: Creates a new category (admin only).
*   `update`: Updates an existing category (admin only).
*   `delete`: Deletes a category (admin only).

## Components Endpoints (`/components`)

*   `getAll`: Fetches all components with filtering and pagination.
*   `getById`: Retrieves a specific component by its ID.
*   `create`: Creates a new component (creator only).
*   `update`: Updates an existing component (creator or admin only).
*   `delete`: Deletes a component (creator or admin only).
*   `toggleStar`: Stars or unstars a component.
*   `rate`: Rates a component.
*   `addComment`: Adds a comment to a component.
*   `getComments`: Fetches all comments for a component.
*   `getStarred`: Retrieves the components starred by the current user.

## Themes Endpoints (`/themes`)

*   `getAll`: Fetches all themes.
*   `getById`: Retrieves a specific theme by its ID.
*   `getDefault`: Fetches the default theme.
*   `create`: Creates a new theme.
*   `update`: Updates an existing theme.
*   `delete`: Deletes a theme.
*   `setDefault`: Sets a theme as the default (admin only).

## Tools Endpoints (`/tools`)

*   `getAll`: Fetches all tools with filtering and pagination.
*   `getById`: Retrieves a specific tool by its ID.
*   `create`: Creates a new tool (creator only).
*   `update`: Updates an existing tool (creator or admin only).
*   `delete`: Deletes a tool (creator or admin only).
*   `toggleStar`: Stars or unstars a tool.
*   `rate`: Rates a tool.
*   `addComment`: Adds a comment to a tool.
*   `getComments`: Fetches all comments for a tool.
*   `getStarred`: Retrieves the tools starred by the current user.

## Users Endpoints (`/users`)

*   `me`: Retrieves the profile of the current user.
*   `updateProfile`: Updates the profile of the current user.
*   `getSettings`: Fetches the settings for the current user.
*   `updateSettings`: Updates the settings for the current user.
*   `getAll`: Fetches all users (admin only).
*   `updateRole`: Updates the role of a user (admin only).
*   `getDashboard`: Retrieves statistics for the user's dashboard.
*   `getActivity`: Fetches the activity feed for the current user.

## Creators Endpoints (`/creators`)

*   `getByUsername`: Retrieves a creator's public profile by username.
*   `getStats`: Fetches statistics for a specific creator.
*   `getComponents`: Retrieves components created by a specific creator.
*   `getProjects`: Fetches public projects by a specific creator.
*   `getMyProfile`: Gets the current user's full profile (protected).
*   `updateProfile`: Updates the current user's profile information (protected).
*   `searchCreators`: Searches for creators with filtering options.

## Projects Endpoints (`/projects`)

*   `getAll`: Fetches all projects with filtering and pagination.
*   `getById`: Retrieves a specific project by ID.
*   `getBySlug`: Fetches a project by its slug.
*   `getBySlugWithRole`: Gets a project with the user's role (for access control).
*   `create`: Creates a new project (protected).
*   `update`: Updates a project (owner/editor only).
*   `delete`: Deletes a project (owner only).
*   `addComponents`: Adds components to a project.
*   `removeComponent`: Removes a component from a project.
*   `addCollaborator`: Adds a collaborator to a project.
*   `removeCollaborator`: Removes a collaborator from a project.
*   `updateCollaboratorRole`: Updates a collaborator's role.
*   `generateInstallConfig`: Generates installation configuration for a project.

## GitHub Endpoints (`/github`)

*   `getRepoInfo`: Fetches repository information from GitHub with caching.
