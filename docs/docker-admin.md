# Docker Admin Setup

This document explains how to create admin users when running cn-registry in Docker containers (like on Coolify).

**✅ The `make-admin-prod` script is included in both the server and web Docker containers.**

## Method 1: Using docker exec

If your containers are already running:

```bash
# Get the container name/ID
docker ps | grep cn-registry

# Run the admin script inside the container
docker exec -e DATABASE_URL="$DATABASE_URL" your-container-name \
  bun run make-admin-prod user@example.com
```

## Method 2: Using docker-compose exec

If using docker-compose:

```bash
# Run in the web or server service
docker-compose exec -e DATABASE_URL="$DATABASE_URL" web \
  bun run make-admin-prod user@example.com
```

## Method 3: Temporary Container

Run a one-off container with the same image:

```bash
docker run --rm \
  -e DATABASE_URL="your-database-url" \
  your-registry-image:tag \
  bun run make-admin-prod user@example.com
```

## Coolify Specific

In Coolify, you can use the "Execute Command" feature:

1. Go to your application
2. Click on "Execute Command" 
3. Run: `bun run make-admin-prod user@example.com`

The `DATABASE_URL` should already be available as an environment variable.

## Environment Variables

Make sure these are set in your container:

- `DATABASE_URL`: PostgreSQL connection string
- Any other database-related environment variables your app needs

## Troubleshooting

### Script not found
```bash
# Check if the script exists
docker exec your-container ls -la scripts/

# Check if bun is available
docker exec your-container which bun
```

### Permission denied
```bash
# Make sure the script is executable
docker exec your-container chmod +x scripts/make-admin-prod.ts
```

### Database connection issues
```bash
# Test database connection
docker exec your-container bun -e "console.log(process.env.DATABASE_URL)"
```