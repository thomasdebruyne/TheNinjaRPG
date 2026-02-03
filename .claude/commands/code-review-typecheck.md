---
description: Runs TypeScript type checking
allowed-tools: Bash(make typecheck:*), Write, TaskCreate, TaskUpdate, TaskList
---

Run TypeScript type checking and report results.

**Arguments**: `$ARGUMENTS` should contain `<IDENTIFIER>`

- **IDENTIFIER** (required): Used to organize review output files

## Process

### Step 1: Create Task Checklist

**BEFORE starting, create tasks for all checks.** Use TaskCreate for each:

1. Run typecheck (`make typecheck`)
2. Parse type errors from output
3. Write findings or return PASS

Use TaskUpdate to mark each task `in_progress` when starting and `completed` when done.

**All checks above are MANDATORY. Every task must be completed before returning PASS or NEEDS FIXES.**

### Step 2: Execute Review

1. Run: `make typecheck`
2. Parse errors from output

## Output

### If type errors found (NEEDS FIXES):

1. **Save detailed findings** to `.claude/review/$IDENTIFIER/typecheck.md` using Write tool (replace `$IDENTIFIER` with actual identifier from arguments):

   ```
   # TypeScript Results

   Stats: X errors

   ## Errors
   - file:line - error code - message
   ...
   ```

2. **Return only**:
   ```
   Typecheck: NEEDS FIXES
   Findings saved to: .claude/review/$IDENTIFIER/typecheck.md
   ```

### If typecheck passes (PASS):

Return only: "Typecheck: PASS"
