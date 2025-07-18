# API Endpoints

This document outlines the API endpoints for the cn-registry application, which are built using tRPC. These endpoints are consumed by the frontend to interact with the backend services.

## Admin Endpoints (`/admin`)

*   `getDashboard`: Retrieves statistics for the admin dashboard.
*   `getNotifications`: Fetches all admin notifications.
*   `createNotification`: Creates a new admin notification.
*   `markNotificationAsRead`: Marks a specific notification as read.
*   `markAllNotificationsAsRead`: Marks all notifications as read.
*   `deleteNotification`: Deletes a notification.
*   `getEditHistory`: Retrieves the history of edits made to components and tools.
*   `getUsersForManagement`: Fetches a list of users for management purposes.

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
