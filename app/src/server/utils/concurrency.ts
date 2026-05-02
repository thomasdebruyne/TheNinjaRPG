/**
 * Optimistic concurrency helpers for MySQL / PlanetScale without traditional transactions.
 *
 * Use **row-level** `updateUserItemQuantityAtomically` / `consumeUserItemAtomically` when the
 * invariant is a single `userItem` stack (consume, craft materials). Use **`claimUserSnapshot`**
 * when multiple fields must commit together or you need to serialize whole-user mutations via
 * `userData.updatedAt` (quest tracker persistence, crafting start, natural bloodline roll).
 *
 * Failed CAS (`success: false` / `false`) means another request mutated the row first — return a
 * safe client error and retry-friendly message.
 */
import { and, eq } from "drizzle-orm";
import { userData, userItem } from "@/drizzle/schema";
import type { DrizzleClient } from "@/server/db";
import type { QueryCondition } from "@/utils/typeutils";

type ClaimUserSnapshotParams = {
  client: DrizzleClient;
  userId: string;
  updatedAt: Date;
  where?: QueryCondition[];
  set?: Record<string, unknown>;
};

/** CAS on `user.updatedAt`: bumps `updatedAt` and merges optional `set` columns when still fresh. */
export const claimUserSnapshot = async ({
  client,
  userId,
  updatedAt,
  where = [],
  set = {},
}: ClaimUserSnapshotParams) => {
  const claimedAt = new Date();
  const result = await client
    .update(userData)
    .set({
      updatedAt: claimedAt,
      ...set,
    })
    .where(
      and(
        eq(userData.userId, userId),
        eq(userData.updatedAt, updatedAt),
        ...where.filter(Boolean),
      ),
    );

  return {
    success: result.rowsAffected === 1,
    claimedAt,
  };
};

type UpdateUserItemQuantityAtomicallyParams = {
  client: DrizzleClient;
  userId: string;
  userItemId: string;
  expectedQuantity: number;
  nextQuantity: number;
};

/**
 * Sets quantity when the row still matches `expectedQuantity`, or deletes the row when
 * `nextQuantity` is 0. Returns false if the row changed concurrently.
 */
export const updateUserItemQuantityAtomically = async ({
  client,
  userId,
  userItemId,
  expectedQuantity,
  nextQuantity,
}: UpdateUserItemQuantityAtomicallyParams) => {
  if (expectedQuantity <= 0 || nextQuantity < 0 || nextQuantity >= expectedQuantity) {
    return false;
  }

  const where = and(
    eq(userItem.id, userItemId),
    eq(userItem.userId, userId),
    eq(userItem.quantity, expectedQuantity),
  );

  const result =
    nextQuantity > 0
      ? await client.update(userItem).set({ quantity: nextQuantity }).where(where)
      : await client.delete(userItem).where(where);

  return result.rowsAffected === 1;
};

type ConsumeUserItemAtomicallyParams = {
  client: DrizzleClient;
  userId: string;
  userItemId: string;
  expectedQuantity: number;
};

/** Decrements quantity by 1 or deletes the stack when quantity was 1. */
export const consumeUserItemAtomically = async ({
  client,
  userId,
  userItemId,
  expectedQuantity,
}: ConsumeUserItemAtomicallyParams) => {
  return updateUserItemQuantityAtomically({
    client,
    userId,
    userItemId,
    expectedQuantity,
    nextQuantity: expectedQuantity - 1,
  });
};
