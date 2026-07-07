import '../src/config/ensure-env';
import { spawnSync } from 'node:child_process';

/**
 * Loads ensure-env then runs a CLI command with the resolved DATABASE_URL / REDIS_URL.
 * Used by Prisma scripts so migrate works with POSTGRES_HOST-style config.
 */
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Usage: tsx scripts/run-with-env.ts <command> [args...]');
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
