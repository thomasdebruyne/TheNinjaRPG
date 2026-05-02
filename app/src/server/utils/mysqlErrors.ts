/**
 * MySQL / Vitess duplicate-key detection for catch blocks around INSERTs guarded by UNIQUE.
 * Driver and layer (Drizzle, mysql2, vttablet) vary in error message text; this covers common shapes.
 */
export const isMysqlDuplicateKeyError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.message.includes("Duplicate entry") ||
    error.message.includes("ER_DUP_ENTRY") ||
    error.message.includes("UNIQUE constraint"));
