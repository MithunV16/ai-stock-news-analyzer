import { Prisma } from '@prisma/client';

/** True when Prisma rejected a create/update due to a unique constraint violation */
export function isUniqueConstraintViolation(error: unknown, field?: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }

  if (!field) {
    return true;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes(field);
  }

  return target === field;
}
