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
```sh
git clone <repo_url>
cd mindful-trader/mindful-trader
npm install
npm run dev
```

## Development Notes
- Keep forms minimal and vertical; avoid modal overload.
- Use language like “notice”, “tend to”, “based on recent trades”.
- No performance/leaderboard features; no gamification.
- Prefer clear, small components; Tailwind utilities; minimal global state.

## Testing & Quality
- Run `npm run lint` before pushing.
- Follow the UX rules and naming guidance in `CLAUDE.md` (e.g., `RiskComfortSelector`, `BehavioralReminder`).

## Deployment
Set up your preferred hosting for a Vite React app (e.g., Netlify, Vercel, static hosting). Ensure SEO meta tags in `index.html` reference MindfulTrade.
