---
description: Fix GitHub PR issues and respond to review comments. Use /automation-fix-github-pr <PR_NUMBER_OR_URL> [optional comment]
allowed-tools: Bash(bash .claude/commands/common/*:*), Bash(git *:*), Bash(gh *:*), Bash(make:*), Task, Skill, TaskCreate, TaskUpdate, TaskList
---

# Fix GitHub PR (Automated)

This command helps you fix issues in an existing GitHub PR by:

1. Fetching the latest remote PR branch and rebasing on main
2. Fetching and addressing all unresolved PR review comments
3. Running the comprehensive code review loop
4. Committing and pushing changes, then replying to comments

**IMPORTANT - AUTONOMOUS EXECUTION**: This command runs fully autonomously. Once invoked, execute ALL steps without asking for user confirmation or input. Implement fixes, commit changes, push, resolve comments, and report completion. Do NOT pause to ask the user questions - make reasonable decisions and proceed.

**Input**: `$ARGUMENTS` contains the GitHub PR number (e.g., `123`) or full PR URL, optionally followed by additional context or specific instructions.

**Optional Comment**: Any text after the PR number/URL is treated as a user comment providing additional context about what should be fixed or prioritized. This comment should be considered alongside the PR review comments when deciding what to fix.

**Identity**: When replying to PR comments, act on behalf of nano.mathias@gmail.com.

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Already checked out on the PR branch

## Workflow

**CRITICAL - TASK LIST REQUIRED**: Before doing ANYTHING else, you MUST create a task list using `TaskCreate` for ALL 9 workflow steps listed below. This ensures you complete every step including commit, push, and replying to comments.

### Step 0: Create Master Task List (MANDATORY)

**IMMEDIATELY** create tasks for ALL workflow steps using TaskCreate. Do this FIRST before any other action:

1. Parse arguments and extract PR number
2. Fetch latest remote branch
3. Rebase on latest main
4. Fetch unresolved PR comments
5. Create sub-tasks for each fix needed
6. Address all fixes (user comment + PR comments)
7. Run code review loop
8. Commit and push changes
9. Reply to and resolve PR comments

**Use TaskUpdate to mark each task `in_progress` when starting and `completed` when done. You MUST NOT stop until ALL tasks show as completed.**

### Step 1: Parse Arguments

Parse `$ARGUMENTS` to extract the PR identifier and optional comment:

**$ARGUMENTS = `$ARGUMENTS`**

- **PR identifier**: The first part of `$ARGUMENTS` (a number like `123` or a GitHub URL)
- **User comment**: Everything after the PR identifier (may be empty)

Store the user comment for use in later steps.

1. If `$ARGUMENTS` is a URL, extract the PR number from it
2. If `$ARGUMENTS` is just a number, use it directly

### Step 2: Fetch Latest Remote Branch

Fetch and reset to the latest remote version of the PR branch to ensure you have the most recent changes:

```bash
git fetch origin
git reset --hard origin/$(git rev-parse --abbrev-ref HEAD)
```

This ensures that if someone else has pushed changes to the PR branch, you incorporate them before making your fixes.

**Note**: This will discard any local uncommitted changes. Since this command runs on a fresh checkout, this should be safe.

### Step 3: Rebase on Latest Main

Rebase the PR branch on top of the latest remote main to ensure it's up to date:

```bash
bash .claude/commands/common/rebase_on_main.sh "." "<TARGET_BRANCH>"
```

The script will output one of these statuses:

- `STATUS=up-to-date` - Branch is already current, continue to Step 4
- `STATUS=success` - Rebase completed successfully, continue to Step 4
- `STATUS=conflicts` - Conflicts detected, resolve them before continuing

#### Handling Rebase Conflicts

If conflicts are detected, the script outputs the conflicted files and conflict markers. For each conflicted file:

1. **Read the file** to see the full conflict context
2. **Understand both sides**:
   - Content between `<<<<<<< HEAD` and `=======` is from the PR branch
   - Content between `=======` and `>>>>>>> origin/main` is from main
3. **Resolve the conflict** by editing the file to combine changes appropriately:
   - Remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Keep the correct code (may need to merge both sides logically)
4. **Stage the resolved file**:
   ```bash
   git add <resolved_file>
   ```
5. **After all conflicts are resolved**, continue the rebase:
   ```bash
   git rebase --continue
   ```

**Tips for conflict resolution:**

- If both sides added different code, you likely need both changes
- If both sides modified the same line, understand the intent of each change
- Prefer keeping newer/main changes for dependencies, configs
- For feature code, merge the PR's intent with main's updates
- **Migration file conflicts**: If conflicts are in migration files (`app/drizzle/migrations/`), it's often best to:
  1. Accept the migration files from main (keep theirs)
  2. Delete the conflicting migration files that were added by this branch
  3. After the rebase completes, re-generate migrations with `make makemigrations`
     This ensures migration files have correct sequential numbering and don't conflict with migrations already in main.

### Step 4: Fetch Unresolved PR Comments

Get all unresolved review comments that need to be addressed:

```bash
bash .claude/commands/common/get_unresolved_comments.sh "<PR_NUMBER>"
```

This returns JSON with unresolved review threads. For each thread, note:

- `thread_id`: The GraphQL node ID (e.g., `PRRT_kwDOG...`) - **needed for resolving the thread in Step 9**
- `path`: File path the comment is on
- `line`: Line number (may be null for file-level comments)
- `comments`: Array of comments in the thread
  - `database_id`: Needed for replying to the comment
  - `body`: The comment text
  - `author`: Who wrote it
  - `diff_hunk`: The code context

**Important**: Parse this output carefully and track both `thread_id` AND `database_id` for each thread. You will need:

- `database_id` (from the first comment) to reply to the thread in Step 9a
- `thread_id` to resolve the thread in Step 9b

### Step 5: Create Tasks for Fixes

Create tasks using TaskCreate for:

1. **User's requested fix (if provided)**: If the user included a comment in `$ARGUMENTS` after the PR number/URL, add this as a high-priority task
2. Each unresolved PR comment as a separate task

### Step 6: Address User Comment and Unresolved PR Comments

**First**, if the user provided a comment in `$ARGUMENTS`:

1. **Prioritize the user's request** - This is what the user specifically wants fixed
2. **Implement the requested change** based on the user's description
3. **This may overlap with PR comments** - The user's comment might be asking you to focus on specific PR feedback

**Then**, for each unresolved PR comment:

1. **Read the comment** and understand what the reviewer is asking for
2. **Navigate to the file** mentioned in `path`
3. **Implement the requested change** or fix
4. **Track the comment** for later reply (Step 9)

### Step 7: Code Review Loop

Run the iterative code review loop using the Skill tool:

```
Skill(skill="implement-review-loop")
```

This runs in the **main thread** and will:

1. Run comprehensive code review (14 parallel checks)
2. Fix any issues found
3. Iterate until all checks pass

**Wait for completion before proceeding.**

### Step 8: Commit and Push Changes

After all fixes and code review are complete, commit and push changes:

```bash
git add .
git commit -m "Address PR feedback"
git push --force-with-lease
```

Use a descriptive commit message summarizing the changes made.

**Note**: Use `--force-with-lease` because the rebase may have rewritten history. This is safe as it will fail if someone else has pushed to the branch since you last fetched.

### Step 9: Reply to and Resolve PR Comments

For each unresolved comment that was addressed:

**Step 9a: Reply to the comment** explaining what was done:

```bash
bash .claude/commands/common/reply_to_comment.sh "<PR_NUMBER>" "<COMMENT_DATABASE_ID>" "<REPLY_BODY>"
```

**Step 9b: Resolve the thread** to mark it as addressed:

```bash
bash .claude/commands/common/resolve_comment.sh "<THREAD_ID>"
```

**Important**: The `THREAD_ID` is the GraphQL node ID from Step 3 (e.g., `PRRT_kwDOG...`), NOT the `COMMENT_DATABASE_ID`. Make sure to track both IDs when parsing the unresolved comments in Step 3.

Guidelines for replies:

- Be concise and professional
- Explain what was changed to address the feedback
- If you couldn't address something, explain why and do NOT resolve the thread
- Reference specific changes (e.g., "Added null check on line 45")
- Sign off as acting on behalf of nano.mathias@gmail.com
- **Always resolve the thread after replying** (unless you couldn't address the issue)

Example reply:

```
Fixed! Added the null check as suggested. The `warHealthInfo` field is now checked before calling `Object.entries()` on line 1177.

— Applied by Claude on behalf of nano.mathias@gmail.com
```

## Example Usage

### Basic Usage (no comment)

User: `/automation-fix-github-pr 895`

### With Optional Comment

User: `/automation-fix-github-pr 895 Please focus on fixing the type errors in the combat system`

In this case:

- PR number: `895`
- User comment: `Please focus on fixing the type errors in the combat system`

The user comment should be prioritized when creating tasks and addressing issues.

**Task list** (created via TaskCreate FIRST):

1. Parse arguments and extract PR number
2. Fetch latest remote branch
3. Rebase on latest main
4. Fetch unresolved PR comments
5. Create sub-tasks for each fix needed
6. Address all fixes (user comment + PR comments)
7. Run code review loop
8. Commit and push changes
9. Reply to and resolve PR comments

**CRITICAL**: All 9 tasks must be marked `completed` via TaskUpdate before the command is finished!

**Execution**:

1. Parse arguments to get PR number `895` and any user comment

2. Rebase on main:

   ```bash
   bash .claude/commands/common/rebase_on_main.sh "." "main"
   ```

   - If conflicts: resolve each file, `git add <file>`, then `git rebase --continue`

3. Fetch comments:

   ```bash
   bash .claude/commands/common/get_unresolved_comments.sh "895"
   ```

4. Create tasks with user comment (high priority) + unresolved comments

5. Address each fix:

   - First: User's requested focus area (type errors in combat system)
   - Then: Each unresolved PR comment

6. Code review loop:

   ```
   Skill(skill="implement-review-loop")
   ```

7. Commit and push:

   ```bash
   git add .
   git commit -m "Address PR feedback: fix type errors in combat system"
   git push --force-with-lease
   ```

8. Reply to and resolve each addressed comment:
   ```bash
   # Reply to the comment
   bash .claude/commands/common/reply_to_comment.sh "895" "12345678" "Fixed! Added null check as suggested."
   # Resolve the thread (use thread_id from Step 3, not comment_database_id)
   bash .claude/commands/common/resolve_comment.sh "PRRT_kwDOG..."
   ```

## Summary Output

After completing ALL steps successfully, provide a clear success summary. This summary confirms the command has finished and all work is complete:

```markdown
## PR Fix Complete: #<PR_NUMBER>

All fixes have been implemented, committed, and pushed to the PR.

### Rebase Status

- Rebased on: origin/main (commit abc123)
- Conflicts resolved: 2 files (or "None")

### Comments Addressed

- [x] @reviewer1: "Add null check" → Fixed
- [x] @reviewer2: "Update error message" → Fixed

### Code Review

- All 14 code review checks passed (or list any remaining issues)

### Changes Committed & Pushed

- Commit: abc123def
- Branch: feature/my-feature
- Message: "Address PR feedback"

### Replies Posted & Threads Resolved

- Replied to and resolved 3 review comments

---

**Status: DONE** - All changes pushed and PR comments resolved.
```

**BEFORE REPORTING DONE**: Verify all 9 tasks show as `completed` via TaskList. If any task is not complete, go back and complete it now.

## Important Notes

- **COMPLETE ALL STEPS** - You MUST complete ALL 9 steps in the workflow. Do NOT stop after fixing code - you MUST also commit, push, and reply to comments. Check your task list via TaskList before finishing.
- **Use force-with-lease for push** - After rebasing, use `git push --force-with-lease` to safely push rewritten history
- **Do NOT add Co-Authored-By lines** - Don't include co-author attribution in commits
- **Professional replies** - Keep PR comment replies concise and helpful
- **Identity** - Act on behalf of nano.mathias@gmail.com when replying
- **Conflict resolution** - When resolving conflicts, understand the intent of both sides before merging; don't blindly accept one side
- **Never add .claude files to git** - The `.claude` folder is gitignored and should not be committed
- **Code review is mandatory** - Always run the code review loop before committing to ensure quality

## Handling Edge Cases

### PR is Already Closed/Merged

Check the PR state first:

```bash
gh pr view <PR_NUMBER> --json state
```

If the PR is closed or merged, report this and ask if the user wants to proceed anyway.

### No Unresolved Comments

If there are no unresolved comments but the user provided a comment in `$ARGUMENTS`, proceed with addressing the user's specific request. If there are no unresolved comments AND no user comment, report that there's nothing to fix.

### Comments Cannot Be Resolved

If you encounter a comment that cannot be resolved (e.g., requires design decision, unclear requirement):

1. Reply explaining why you couldn't fully address it
2. Do NOT resolve the thread
3. Include it in the summary output as "Needs human review"
