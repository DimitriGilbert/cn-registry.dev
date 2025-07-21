#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
until pg_isready -h postgres -p 5432 -U ${POSTGRES_USER:-postgres}; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "Database is ready!"

# Start the application
echo "Starting application..."
exec "$@"