import { execSync } from 'node:child_process';
import path from 'node:path';
import { logger } from '@/utils/logger';

/**
 * One-command local DB bootstrap:
 * 1. Start Docker services (PostgreSQL + Redis)
 * 2. Wait for PostgreSQL port
 * 3. Apply Prisma migrations
 * 4. Seed companies
 */
const composeFile = path.resolve(__dirname, '../../docker/docker-compose.yml');

function run(command: string): void {
  logger.info(`Running: ${command}`);
  execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
}

try {
  run(`docker compose -f "${composeFile}" up -d`);
  run('npx tsx scripts/wait-for-db.ts');
  run('npx tsx scripts/run-with-env.ts prisma migrate deploy');
  run('npx tsx prisma/seed.ts');
  logger.info('Database setup complete');
} catch (error) {
  logger.error('Database setup failed', { error });
  process.exit(1);
}
