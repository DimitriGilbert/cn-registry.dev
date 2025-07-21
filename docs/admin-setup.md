# Admin Setup Guide

This guide explains how to create admin users for the cn-registry application.

## Creating Admin Users

There are two scripts available for creating admin users:

### 1. Development Script (`make-admin.ts`)

For local development with `.env` files:

```bash
bun run make-admin user@example.com
```

**Requirements:**
- Requires `apps/server/.env` file with `DATABASE_URL`
- Only works in development environment

### 2. Production Script (`make-admin-prod.ts`)

For production environments where environment variables are set dynamically (like Coolify, Docker, etc.):

```bash
DATABASE_URL="postgresql://user:password@host:port/database" bun run make-admin-prod user@example.com
```

**Requirements:**
- `DATABASE_URL` environment variable must be set
- No `.env` file required
- Works in any environment (development, production, Docker containers)

## Usage Examples

### Local Development
```bash
# Make sure you have apps/server/.env with DATABASE_URL
bun run make-admin dimitri.gilbert@gmail.com
```

### Production/Coolify Deployment
```bash
# Set DATABASE_URL environment variable and run
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/cn_registry" \
bun run make-admin-prod dimitri.gilbert@gmail.com
```

### Docker Container
```bash
# Run inside the container with environment variables
docker exec container_name \
  bun run make-admin-prod user@example.com

# The DATABASE_URL should already be available in the container
# If not, you can pass it explicitly:
docker exec -e DATABASE_URL="$DATABASE_URL" container_name \
  bun run make-admin-prod user@example.com
```

## Prerequisites

1. **User must exist**: The user must have already signed up through the application
2. **Database access**: The script needs access to the PostgreSQL database
3. **Valid email**: Provide the exact email address the user registered with

## Script Output

Successful execution:
```
🔍 Looking for user with email: user@example.com
🎉 Successfully made "user@example.com" an admin!
User: John Doe (user@example.com)
They can now access the admin panel
```

If user doesn't exist:
```
❌ User with email "user@example.com" not found
Make sure the user has signed up first
```

If user is already admin:
```
✅ User "user@example.com" is already an admin
```

## Troubleshooting

### "Cannot find package 'dotenv'"
- Use `make-admin-prod` script instead of `make-admin`
- The production script doesn't require dotenv

### "DATABASE_URL environment variable is required"
- Set the `DATABASE_URL` environment variable
- Make sure it follows PostgreSQL connection string format: `postgresql://username:password@host:port/database`

### "User not found"
- Verify the email address is correct
- Make sure the user has completed the signup process
- Check the database to confirm the user exists

### Database connection errors
- Verify DATABASE_URL is correct
- Ensure the database is running and accessible
- Check network connectivity to the database host

## Security Notes

- Only trusted administrators should have access to these scripts
- Keep database credentials secure
- Consider using environment variables or secret management systems
- Regularly review admin user permissions