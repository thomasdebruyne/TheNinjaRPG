---
description: Automate a complex request using 6 parallel planners (3 Claude + 3 Codex), plan aggregation, and implementation. Use /automation-request <INSTRUCTIONS>
allowed-tools: Bash(codex *:*), Task, Skill, Read
---

# Automate Request

Automate a complex feature request or bug fix by leveraging 6 parallel planning agents (3 Claude + 3 Codex), plan aggregation, and iterative implementation with code review.

**Input**: `$ARGUMENTS` contains arbitrary instructions describing:

- A feature to implement
- A bug to fix
- An improvement to make
- Any complex coding task

## Purpose

This command orchestrates a multi-agent workflow to handle complex requests:

1. **Parallel Planning** - Launch 6 independent planners (3 Claude Task + 3 Codex CLI) to investigate and create implementation plans
2. **Plan Aggregation** - Synthesize the best elements from all plans into one comprehensive plan
3. **Implementation** - Implement the aggregated plan
4. **Code Review Loop** - Iteratively review and fix until all quality checks pass

This approach ensures:

- Multiple perspectives on the problem from different AI models
- Thorough exploration of the codebase
- Best solutions are identified through comparison
- High-quality implementation through iterative reviews

## Workflow

**IMPORTANT**: Create a todo list with all the steps below and follow them in order.

### Step 1: Parse and Validate Input

Extract the instructions from `$ARGUMENTS`:

**$ARGUMENTS = `$ARGUMENTS`**

1. Parse the input instructions
2. Generate a unique task identifier based on the request (e.g., `feature-auth-system`, `bugfix-user-sync`, `improvement-perf-cache`)
3. Ensure `.claude/tasks/` directory exists

### Step 2: Generate Implementation Plans (6 Parallel Planners)

Launch **6 parallel planners** to generate diverse perspectives on the solution:

- **3 Claude Task subagents** using the `Task` tool
- **3 Codex CLI planners** using the `Bash` tool

#### 2a: Claude Task Subagents (3 parallel)

For each of the 3 subagents, use this prompt with the `Task` tool:

```
Run the /plan-implementation skill with the argument: INSTRUCTIONS

After completion, report ONLY the path to the saved plan file.
```

#### 2b: Codex CLI Planners (3 parallel)

For each of the 3 Codex planners, run this command in the `Bash` tool with `block_until_ms: 0` to background immediately:

```bash
codex exec --dangerously-bypass-approvals-and-sandbox "Run the /plan-implementation command found in .claude/commands folder with argument: INSTRUCTIONS. After completion, report the path to the saved plan file."
```

**Important**: Run each codex command in a separate Bash call so they run in parallel. After launching, monitor the terminal files to wait for completion and extract the plan file paths from the output.

Replace `INSTRUCTIONS` with the exact content from `$ARGUMENTS` in all commands.

**Wait for all 6 planners to complete.** Collect the 6 plan file paths they return (e.g., `.claude/tasks/20250131-143052_IMPL_PLAN-feature_name-abc123.md`).

### Step 3: Aggregate Plans

<important>DO NOT AGGREGATE UNTIL ALL PLANS HAVE BEEN GENERATED. CODEX MAY PRODUCE SLOW PLANS; BUT WAIT TILL THEY ARE DONE</important>

Launch a subagent using the `Task` tool to aggregate all 6 plans into one comprehensive plan:

```
Run the /plan-aggregate skill with the arguments: PLAN1_PATH PLAN2_PATH PLAN3_PATH PLAN4_PATH PLAN5_PATH PLAN6_PATH

Where:
- PLAN1_PATH = [path from Claude subagent 1]
- PLAN2_PATH = [path from Claude subagent 2]
- PLAN3_PATH = [path from Claude subagent 3]
- PLAN4_PATH = [path from Codex planner 1]
- PLAN5_PATH = [path from Codex planner 2]
- PLAN6_PATH = [path from Codex planner 3]

After completion, report the path to the aggregated plan file.
```

**Wait for the subagent to complete.** Save the aggregated plan path for the next step.

### Step 4: Implement the Aggregated Plan

Launch a subagent using the `Task` tool to implement the aggregated plan:

```
Run the /implement skill with the argument: AGGREGATED_PLAN_PATH

Where AGGREGATED_PLAN_PATH = [path to aggregated plan from step 3]

Implement the changes following the plan. Report when complete.
```

**Wait for the subagent to complete.**

**Note**: The `/implement` skill focuses ONLY on implementation with self-evaluation. It does NOT run code review - that's handled in the next step.

### Step 5: Code Review Loop

Run the iterative code review loop using the Skill tool:

```
Skill(skill="implement-review-loop")
```

This runs in the **main thread** and will:

1. Run comprehensive code review (14 parallel checks)
2. Fix any issues found
3. Iterate until all checks pass

**Wait for completion before proceeding.**

### Step 6: Final Report

After all steps are complete, generate a comprehensive report:

```markdown
# Automation Request Complete

## Original Request

<Brief summary of the original instructions>

## Planning Phase

- **Total Plans Generated**: 6 (3 Claude, 3 Codex)
- **Claude Plan 1**: `<path>` - <brief summary of approach>
- **Claude Plan 2**: `<path>` - <brief summary of approach>
- **Claude Plan 3**: `<path>` - <brief summary of approach>
- **Codex Plan 1**: `<path>` - <brief summary of approach>
- **Codex Plan 2**: `<path>` - <brief summary of approach>
- **Codex Plan 3**: `<path>` - <brief summary of approach>

## Aggregation Phase

- **Aggregated Plan**: `<path>`
- **Best Elements Selected From**:
  - Plan 1: <what was used>
  - Plan 2: <what was used>
  - (etc.)

## Implementation Phase

- **Status**: Complete / Partial / Failed
- **Changes Made**:
  - <list of key changes>
- **Files Modified**:
  - <list of files>

## Code Review Phase

- **Iterations**: <number of review cycles>
- **Final Status**: All checks passed / Issues remaining

## Summary

<Overall summary of what was accomplished>

## Artifacts

- Individual Plans: `.claude/tasks/*_IMPL_PLAN-*.md`
- Aggregated Plan: `.claude/tasks/*_AGGREGATED-*.md`

## Next Steps (if any)

<Any remaining work or recommendations>
```

## Example Usage

User: `/automation-request Add a new settings page that allows users to configure notification preferences`

**Todo list**:

1. [ ] Parse instructions and generate task identifier
2. [ ] Run 6 parallel planners (3 Claude, 3 Codex)
3. [ ] Aggregate all 6 plans with `/plan-aggregate`
4. [ ] Implement with `/implement`
5. [ ] Run `/implement-review-loop` (code review)
6. [ ] Generate final report

**Execution**:

1. Parse instructions:

   - Instructions: "Add a new settings page that allows users to configure notification preferences"
   - Task ID: `feature-notification-settings`

2. Run 6 parallel planners (all at the same time):

   **Claude Task subagents:**

   ```
   Task: "Run /plan-implementation Add a new settings page that allows users to configure notification preferences"
   Task: "Run /plan-implementation Add a new settings page that allows users to configure notification preferences"
   Task: "Run /plan-implementation Add a new settings page that allows users to configure notification preferences"
   ```

   **Codex CLI planners (in Bash with block_until_ms: 0):**

   ```bash
   codex exec --dangerously-bypass-approvals-and-sandbox "Run the /plan-implementation command found in .claude/commands folder with argument: Add a new settings page that allows users to configure notification preferences. After completion, report the path to the saved plan file."
   ```

   (Run 3 times in parallel Bash calls)

   Results (after monitoring terminal output for completion):

   - Claude Plan 1: `.claude/tasks/20250131-143052_IMPL_PLAN-settings_page-abc123.md`
   - Claude Plan 2: `.claude/tasks/20250131-143053_IMPL_PLAN-notification_settings-def456.md`
   - Claude Plan 3: `.claude/tasks/20250131-143054_IMPL_PLAN-user_prefs-ghi789.md`
   - Codex Plan 1: `.claude/tasks/20250131-143055_IMPL_PLAN-settings_ui-jkl012.md`
   - Codex Plan 2: `.claude/tasks/20250131-143056_IMPL_PLAN-prefs_api-mno345.md`
   - Codex Plan 3: `.claude/tasks/20250131-143057_IMPL_PLAN-notif_schema-pqr678.md`

3. Aggregate all 6 plans:

   ```
   Task: "Run /plan-aggregate .claude/tasks/20250131-143052_IMPL_PLAN-settings_page-abc123.md .claude/tasks/20250131-143053_IMPL_PLAN-notification_settings-def456.md .claude/tasks/20250131-143054_IMPL_PLAN-user_prefs-ghi789.md .claude/tasks/20250131-143055_IMPL_PLAN-settings_ui-jkl012.md .claude/tasks/20250131-143056_IMPL_PLAN-prefs_api-mno345.md .claude/tasks/20250131-143057_IMPL_PLAN-notif_schema-pqr678.md"
   ```

   Result: `.claude/tasks/20250131-143100_IMPL_PLAN_AGGREGATED-xyz789-merged_plan.md`

4. Implement:

   ```
   Task: "Run /implement .claude/tasks/20250131-143100_IMPL_PLAN_AGGREGATED-xyz789-merged_plan.md"
   ```

5. Code review loop:

   ```
   Skill(skill="implement-review-loop")
   ```

6. Generate final report with all details.

## Important Notes

- **6 parallel plans** - Running 6 planners (3 Claude, 3 Codex) maximizes solution quality through diverse analysis from different AI models
- **Monitor CLI planners** - The Codex CLI commands run in the background; monitor their terminal output files to detect completion and extract the plan file paths
- **Separate review loop** - Code review runs in the main thread via `/implement-review-loop` after implementation completes
- **Never add .claude files to git** - The `.claude` folder is gitignored and should not be committed
- **Independence matters** - Each planner works independently without knowledge of others
- **Wait for completion** - Always wait for all planners to finish before proceeding to aggregation

## Handling Edge Cases

### Fewer Than 6 Plans Generated

If some planners fail:

- Proceed with plan aggregation using available plans (minimum 1 plan required)
- Report which planners failed in the final report
- Note: Even with fewer plans, the aggregation will synthesize the best approach

### Plan Aggregation Fails

If plan aggregation fails:

1. Report the error with details from individual plans
2. Attempt to use the highest-quality individual plan directly
3. Proceed with implementation using the best available plan

### Implementation Fails

If implementation fails:

1. Report what was accomplished
2. Detail what remains to be done
3. Include relevant error messages
4. Suggest next steps for manual intervention

### Code Review Doesn't Converge

If the review loop runs more than 5 iterations without all checks passing:

1. Stop the loop
2. Report the remaining issues
3. Note what was fixed during the iterations
4. Suggest manual review for the remaining items
