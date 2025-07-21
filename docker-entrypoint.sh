#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
until pg_isready -h postgres -p 5432 -U $POSTGRES_USER; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "Database is ready!"

# Push database schema
echo "Setting up database schema..."
cd /app/apps/server
bun run db:push

# Start the application
echo "Starting application..."
exec "$@"