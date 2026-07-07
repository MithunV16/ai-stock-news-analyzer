#!/bin/sh
set -e

# Build DATABASE_URL from parts when not explicitly set
if [ -z "$DATABASE_URL" ]; then
  POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
  POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  POSTGRES_USER="${POSTGRES_USER:-postgres}"
  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
  POSTGRES_DB="${POSTGRES_DB:-stock_news_analyzer}"
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
fi

if [ -z "$REDIS_URL" ]; then
  REDIS_HOST="${REDIS_HOST:-redis}"
  REDIS_PORT="${REDIS_PORT:-6379}"
  export REDIS_URL="redis://${REDIS_HOST}:${REDIS_PORT}"
fi

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed || echo "Seed skipped or already applied"
fi

echo "Starting API server..."
exec node dist/index.js
