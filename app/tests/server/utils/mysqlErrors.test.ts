// @vitest-environment node

import { describe, expect, it } from "vitest";
import { isMysqlDuplicateKeyError } from "@/server/utils/mysqlErrors";

describe("isMysqlDuplicateKeyError", () => {
  it("returns true for common MySQL duplicate messages", () => {
    expect(
      isMysqlDuplicateKeyError(
        new Error(
          "Duplicate entry 'x' for key 'BloodlineRolls.BloodlineRolls_natural_roll_per_user_key'",
        ),
      ),
    ).toBe(true);
    expect(isMysqlDuplicateKeyError(new Error("ER_DUP_ENTRY: duplicate"))).toBe(
      true,
    );
    expect(isMysqlDuplicateKeyError(new Error("UNIQUE constraint failed"))).toBe(
      true,
    );
  });

  it("returns false for unrelated errors and non-errors", () => {
    expect(isMysqlDuplicateKeyError(new Error("connection timeout"))).toBe(false);
    expect(isMysqlDuplicateKeyError(null)).toBe(false);
    expect(isMysqlDuplicateKeyError("Duplicate entry")).toBe(false);
  });
});
