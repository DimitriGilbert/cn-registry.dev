# Component Import Guide

This guide explains how to bulk import components and tools into the cn-registry using the automated import scripts.

## Overview

The import system allows you to:
- Bulk import components and tools from JSON files
- Handle partial data gracefully with smart defaults
- Automatically create missing categories
- Assign to appropriate admin users
- Skip duplicates to prevent conflicts

## Quick Start

1. **Prepare your data** in JSON format (see examples below)
2. **Test database connection**: `bun scripts/test-import.ts`
3. **Import components**: `bun scripts/import-components.ts your-data.json`

## Data Format

### Complete Component Example
```json
{
  "name": "Animated Button",
  "description": "A beautiful animated button component with hover effects",
  "repoUrl": "https://github.com/example/animated-button",
  "websiteUrl": "https://animated-button-demo.com",
  "installUrl": "https://ui.shadcn.com/docs/components/button",
  "installCommand": "npx shadcn-ui@latest add button",
  "tags": ["button", "animation", "interactive", "ui"],
  "status": "published",
  "categoryNames": ["Buttons", "Interactive"]
}
```

### Minimal Component Example
```json
{
  "name": "Simple Modal",
  "description": "A basic modal dialog"
}
```

### Batch Import Example
```json
[
  {
    "name": "Data Table",
    "description": "Powerful table with sorting and filtering",
    "repoUrl": "https://github.com/example/data-table",
    "tags": ["table", "data", "sorting"],
    "categoryNames": ["Tables"]
  },
  {
    "name": "Progress Bar",
    "description": "Animated progress indicator",
    "tags": ["progress", "animation"],
    "status": "suggested"
  }
]
```

## Field Reference

### Required Fields
- `name` (string): Unique component name

### Optional Fields
- `description` (string): Component description *(default: "Component description")*
- `repoUrl` (string): GitHub repository URL
- `websiteUrl` (string): Demo or documentation website
- `installUrl` (string): Installation guide URL
- `installCommand` (string): CLI installation command
- `tags` (array): Array of tag strings *(default: [])*
- `status` (enum): One of `published`, `draft`, `archived`, `suggested` *(default: "suggested")*
- `categoryNames` (array): Array of category names *(default: [])*

### Status Values
- **`published`**: Live and visible to all users
- **`draft`**: Visible to creators and admins only
- **`archived`**: Hidden but preserved
- **`suggested`**: Community suggestions awaiting review

## Smart Defaults

The import system applies intelligent defaults for missing data:

```typescript
const DEFAULT_VALUES = {
  description: "Component description",
  status: "suggested",
  tags: [],
  categoryNames: [],
};
```

## Category Management

### Automatic Creation
Categories are created automatically if they don't exist:

```json
{
  "name": "New Widget",
  "categoryNames": ["Widgets", "New Category"]
  // "New Category" will be created automatically
}
```

### Existing Categories
Existing categories are reused, ensuring data consistency.

## Import Process

### 1. Database Connection Test
```bash
bun scripts/test-import.ts
```

**Expected Output:**
```
🔌 Testing database connection...
✅ Database connection successful!
👤 Found 1 admin user(s)
✅ Admin users available for component assignment
📁 Found 5 existing categories
🎉 Ready to import components!
```

### 2. Component Import
```bash
bun scripts/import-components.ts data/my-components.json
```

**Expected Output:**
```
📦 Found 4 components to import
🔌 Testing database connection...
👤 Using system user ID: user_abc123
✅ Imported component: "Animated Button" (published)
  📂 Linked to categories: Buttons, Interactive
📁 Created new category: "New Widgets"
✅ Imported component: "Widget Slider" (suggested)
  📂 Linked to categories: New Widgets
⚠️  Component "Existing Button" already exists, skipping...

🎉 Import completed!
  ✅ Imported: 3 components
  ⚠️  Skipped: 1 components
```

## Error Handling

### Common Issues

#### Database Connection Failed
```
❌ Database connection failed. Please ensure:
   1. Database is running: bun run db:start
   2. Environment variables are correct in apps/server/.env
   3. Database schema is up to date: bun run db:push
```

**Solution**: Follow the numbered steps to resolve database issues.

#### No Admin User Found
```
❌ No admin user found. Please create one first:
   bun scripts/make-admin.ts <email>
```

**Solution**: Create an admin user before importing components.

#### Duplicate Components
```
⚠️  Component "Button" already exists, skipping...
```

**Solution**: This is normal behavior. Duplicates are safely skipped.

#### Invalid JSON
```
❌ Error during import: Unexpected token in JSON
```

**Solution**: Validate your JSON syntax using a JSON validator.

### Validation Errors

The import system validates all data and provides helpful error messages:

```bash
⚠️  Skipping component with missing name: { "description": "No name provided" }
❌ Failed to import "Invalid Component": Invalid URL format
```

## Best Practices

### Data Preparation
1. **Validate JSON**: Use a JSON validator before importing
2. **Consistent Naming**: Use clear, descriptive component names
3. **Category Planning**: Plan category structure beforehand
4. **URL Validation**: Ensure all URLs are accessible

### Import Strategy
1. **Test First**: Always run `test-import.ts` before importing
2. **Small Batches**: Import in smaller batches for easier debugging
3. **Backup Data**: Keep original JSON files as backups
4. **Review Results**: Check imported components in admin panel

### Quality Control
1. **Review Status**: Set appropriate status for each component
2. **Tag Consistency**: Use consistent tagging conventions
3. **Description Quality**: Provide meaningful descriptions
4. **Category Organization**: Organize categories logically

## Advanced Usage

### Custom Import Scripts
You can create custom import scripts by extending the base functionality:

```typescript
import { db } from "../apps/server/src/db";
import { components } from "../apps/server/src/db/schema";

// Custom import logic here
```

### Bulk Status Updates
To update status of imported components:

```sql
-- Update all suggested components to published
UPDATE components 
SET status = 'published' 
WHERE status = 'suggested';
```

### Category Management
```sql
-- List all categories with component counts
SELECT c.name, COUNT(cc.component_id) as component_count
FROM categories c
LEFT JOIN component_categories cc ON c.id = cc.category_id
GROUP BY c.id, c.name
ORDER BY component_count DESC;
```

## Troubleshooting

### Performance Issues
- **Large Imports**: Break large files into smaller chunks
- **Memory Usage**: Monitor memory during large imports
- **Database Load**: Import during low-traffic periods

### Data Quality Issues
- **Missing Descriptions**: Review and update after import
- **Inconsistent Tags**: Standardize tags post-import
- **Category Cleanup**: Merge duplicate categories if needed

### Recovery
- **Failed Imports**: Re-run import (duplicates will be skipped)
- **Data Corruption**: Restore from backup and re-import
- **Category Issues**: Manually fix in admin panel

## Integration with External Sources

The import system is designed to work with data from:
- **Component Libraries**: shadcn/ui, Material-UI, etc.
- **Package Registries**: npm, GitHub, etc.
- **Curated Lists**: Awesome lists, component galleries
- **Research Tools**: Automated component discovery