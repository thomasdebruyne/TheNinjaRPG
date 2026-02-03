---
description: Runs Biome
allowed-tools: Bash(make lint:*), Write, TaskCreate, TaskUpdate, TaskList
---

Run Biome linting and report results.

**Arguments**: `$ARGUMENTS` should contain `<IDENTIFIER>`

- **IDENTIFIER** (required): Used to organize review output files

## Process

### Step 1: Create Task Checklist

**BEFORE starting, create tasks for all checks.** Use TaskCreate for each:

1. Run biome linting (`make lint`)
2. Parse errors/warnings from output
3. Write findings or return PASS

Use TaskUpdate to mark each task `in_progress` when starting and `completed` when done.

**All checks above are MANDATORY. Every task must be completed before returning PASS or NEEDS FIXES.**

### Step 2: Execute Review

1. Run: `make lint`
2. Parse errors/warnings from output

## Output

### If lint issues found (NEEDS FIXES):

1. **Save detailed findings** to `.claude/review/$IDENTIFIER/lint.md` using Write tool (replace `$IDENTIFIER` with actual identifier from arguments):

   ```
   # Biome Linting Results

   Stats: X errors, Y warnings

   ## Issues
   - file:line - rule - message
   ...
   ```

2. **Return only**:
   ```
   Lint: NEEDS FIXES
   Findings saved to: .claude/review/$IDENTIFIER/lint.md
   ```

### If lint passes (PASS):

Return only: "Lint: PASS"
