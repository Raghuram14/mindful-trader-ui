# MindfulTrade – Behavioral Intelligence Platform

MindfulTrade helps active retail traders notice emotional patterns, pre-commit to risk comfort, and trade with calm discipline. The product is a mirror, not a scoreboard: no charts, no signals, no hype.

## Core Principles (read first)
- Behavior over performance; awareness over optimization.
- Calm tone: avoid urgency, shame, or hype.
- Risk Comfort is central: “How much can I lose and stay emotionally stable?”
- Dark, quiet UI; muted success/failure cues.

For detailed guidance, see `CLAUDE.md` (must-read before coding).

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- React Router, TanStack Query, Zod

## Getting Started

### 1. Clone and Install

```sh
git clone <repo_url>
cd mindful-trader-ui
npm install
```

### 2. Setup Git Hooks (Required)

**Important:** Set up pre-push hooks to verify code quality before pushing:

```sh
npm run setup-hooks
```

This installs git hooks that will automatically:
- ✅ Run ESLint before every push
- ✅ Run TypeScript type checking
- ✅ Build the project to ensure it compiles

**If any check fails, the push will be blocked.** This prevents broken code from being pushed.

> 💡 **Tip:** You can manually verify your code anytime with `npm run verify`

### 3. Start Development

```sh
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

## Development Notes
- Keep forms minimal and vertical; avoid modal overload.
- Use language like “notice”, “tend to”, “based on recent trades”.
- No performance/leaderboard features; no gamification.
- Prefer clear, small components; Tailwind utilities; minimal global state.

## Testing & Quality

### Pre-push Verification

The git hooks (set up in step 2) automatically verify code quality before pushing. You can also run checks manually:

```sh
# Run all checks (lint + type-check + build)
npm run verify

# Run individual checks
npm run lint          # ESLint
npm run type-check    # TypeScript type checking
npm run build         # Build verification
```

### Code Quality Guidelines

- Follow the UX rules and naming guidance in `CLAUDE.md` (e.g., `RiskComfortSelector`, `BehavioralReminder`)
- Ensure all checks pass before pushing (`npm run verify`)
- The CI pipeline will also run these checks on GitHub

> 📖 For detailed git hooks documentation, see [README-GIT-HOOKS.md](./README-GIT-HOOKS.md)

## Deployment
Set up your preferred hosting for a Vite React app (e.g., Netlify, Vercel, static hosting). Ensure SEO meta tags in `index.html` reference MindfulTrade.
