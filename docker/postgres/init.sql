# Optional PostgreSQL extensions and defaults applied on first container start.
-- Enable UUID generation if needed in future migrations
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log successful init (visible in container logs)
DO $$
BEGIN
  RAISE NOTICE 'stock_news_analyzer database initialized';
END $$;
