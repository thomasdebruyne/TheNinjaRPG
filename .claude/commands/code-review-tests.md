---
description: Runs test suite
allowed-tools: Bash(make test:*), Write, TaskCreate, TaskUpdate, TaskList
---

Run tests and report results.

**Arguments**: `$ARGUMENTS` should contain `<IDENTIFIER>`

- **IDENTIFIER** (required): Used to organize review output files

## Process

### Step 1: Create Task Checklist

**BEFORE starting, create tasks for all checks.** Use TaskCreate for each:

1. Run tests (`make test`)
2. Parse pass/fail counts
3. Write findings or return PASS

Use TaskUpdate to mark each task `in_progress` when starting and `completed` when done.

**All checks above are MANDATORY. Every task must be completed before returning PASS or NEEDS FIXES.**

### Step 2: Execute Review

1. Run: `make test`
2. Parse pass/fail counts from output

## Output

### If test failures found (NEEDS FIXES):

1. **Save detailed findings** to `.claude/review/$IDENTIFIER/tests.md` using Write tool (replace `$IDENTIFIER` with actual identifier from arguments):

   ```
   # Test Results

   Stats: X passed, Y failed, Z total

   ## Failures
   - test name: error message
   ...
   ```

2. **Return only**:
   ```
   Tests: NEEDS FIXES
   Findings saved to: .claude/review/$IDENTIFIER/tests.md
   ```

### If tests pass (PASS):

Return only: "Tests: PASS"
