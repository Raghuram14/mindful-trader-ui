# Git Hooks Setup

This repository includes pre-push hooks that verify your code before pushing to GitHub.

## Setup (One-time)

Run this command once to install the git hooks:

```bash
npm run setup-hooks
```

Or manually:

```bash
bash scripts/setup-git-hooks.sh
```

## What It Does

Before every `git push`, the hook will automatically:

1. ✅ Run ESLint to check for linting errors
2. ✅ Run TypeScript type checking
3. ✅ Build the project to ensure it compiles

**If any step fails, the push will be blocked.**

## Manual Verification

You can manually run the checks anytime:

```bash
npm run verify
```

This runs: `lint` → `type-check` → `build`

## Bypassing Hooks (Not Recommended)

If you absolutely need to bypass the hooks (not recommended):

```bash
git push --no-verify
```

⚠️ **Warning**: Only use this if you understand the risks. The CI will still fail if there are errors.

## Troubleshooting

### Hook not running?
- Make sure you ran `npm run setup-hooks`
- Check that `.git/hooks/pre-push` exists and is executable
- Verify you're in the repository root

### Script permission denied?
```bash
chmod +x scripts/pre-push.sh
chmod +x scripts/setup-git-hooks.sh
```

