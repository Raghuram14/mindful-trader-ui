# Frontend AI Context

## MindfulTrade – Behavioral Intelligence Platform

> **Read this document fully before generating or modifying code.**
> This project prioritizes **behavioral clarity and emotional safety** over features or speed.

---

## 1. What This Product Is (Non-Negotiable)

**MindfulTrade** is a **Behavioral Intelligence Platform for Retail Traders**.

Its purpose is to help traders:

* Recognize emotional decision patterns
* Pre-commit to risk comfort
* Improve discipline and consistency
* Reduce fear-based and impulse-based mistakes

This is **NOT**:

* A trading platform
* A signal provider
* A performance optimizer
* A charting or analytics dashboard

👉 The product focuses on **behavior change**, not prediction.

---

## 2. Core Product Philosophy

### Behavior > Performance

### Awareness > Optimization

### Calm > Excitement

### Reflection > Reaction

Every UI decision, component, and copy choice must align with this.

If a feature:

* Adds noise
* Increases urgency
* Encourages dopamine behavior
* Focuses on P&L obsession

👉 **Do NOT build it.**

---

## 3. Target User (Frontend Must Respect This)

Primary user:

* Active retail trader (stocks/options)
* Trades 3–5 times per week
* Knows strategies already
* Struggles with **discipline, fear, overconfidence**

Non-users:

* Beginners
* Signal-dependent traders
* Gamblers
* Algo traders

UI must **never talk down**, hype, or shame the user.

---

## 4. UX Principles (STRICT RULES)

### 4.1 Interaction Rules

* Any user action must take **<10 seconds**
* Forms must be **minimal & vertical**
* No modal overload
* No unnecessary confirmations

### 4.2 Language Rules

Use:

* “Notice”
* “Tend to”
* “Often”
* “Based on recent trades”

Avoid:

* “You failed”
* “Bad trade”
* “Mistake”
* “Should have”

Tone must feel like a **calm coach**, not a judge.

---

## 5. Design System Constraints

### Visual Style

* Dark mode by default
* Low contrast highlights
* Muted reds/greens (no harsh loss/win colors)
* No flashing elements
* No gamification

### Layout

* Web-first, mobile-friendly
* Sidebar navigation (desktop)
* Collapsible navigation (mobile)
* Large tap/click targets

---

## 6. Core Screens (Frontend Scope)

### 6.1 Homepage

Purpose:

* Explain behavioral value
* Differentiate from psychology trackers
* Emphasize risk comfort + coaching

No charts.
No performance claims.

---

### 6.2 Today Screen

Purpose:

* Orient the trader
* Encourage alignment with plan

Components:

* “Add Trade” primary CTA
* Open trades summary
* Behavioral reminder (text only)

---

### 6.3 Add Trade (Critical Screen)

Purpose:

* Pre-commitment before emotion kicks in

Required inputs:

* Symbol
* Buy/Sell
* Confidence (1–5)
* **Risk Comfort (₹ amount)**

Optional:

* Planned stop
* Planned target
* Why this trade (1 line)

❗ Do NOT show position sizing math
❗ Do NOT auto-calculate lot sizes loudly

---

### 6.4 Trade Detail (During Trade)

Purpose:

* Passive awareness

Show:

* Entry info
* Planned stop/target
* Time in trade
* **Risk comfort amount**

Optional:

* Emotion quick taps (Fear / Neutral / Confident)

No charts.
No alerts.

---

### 6.5 Exit Trade (Most Sensitive UX)

Purpose:

* Capture truth without judgment

Mandatory question:

> “Why did you exit?”

Options:

* Target hit
* Stop hit
* Fear
* Unsure
* Impulse

Optional reflection text.

This screen must feel **safe**.

---

### 6.6 Weekly Insights

Purpose:

* Create self-recognition

Show ONLY:

1. Behavioral score (Plan vs Execution)
2. One key pattern
3. One coaching nudge

Text only.

---

### 6.7 Trade History

Purpose:

* Contextual review

List view:

* Symbol
* Win/Loss (muted)
* Confidence
* Risk comfort
* Exit reason

No charts.

---

## 7. Risk Comfort (Very Important Concept)

**Risk Comfort** =
“How much can I lose on this trade and still stay emotionally stable?”

This is:

* A psychological boundary
* A pre-commitment tool
* NOT optimization math

Frontend rules:

* Show ₹ presets + custom
* Display quietly in trade views
* Use it later for behavioral insights
* Never shame users for high risk

---

## 8. AI Coding Rules (Cursor Guidance)

When generating code:

* Prefer **clarity over cleverness**
* Prefer **readable components**
* Prefer **explicit naming**
* Avoid premature abstractions

State management:

* Simple local state preferred
* No heavy global state unless required

Styling:

* Tailwind utility classes
* Avoid inline styles
* Keep components small and focused

---

## 9. What NOT to Build (Explicit)

❌ Charts
❌ Indicators
❌ Signal suggestions
❌ Leaderboards
❌ Social feeds
❌ Notifications (v1)
❌ “Streaks” or gamified scores

These violate product philosophy.

---

## 10. Success Criteria (Frontend Perspective)

The frontend is successful if:

* A trader feels **understood**, not evaluated
* UI reduces emotional friction
* Users pause before impulsive actions
* Copy feels human and calm

If the UI feels like a **trading terminal**, it has failed.

---

## 11. How AI Should Think While Coding

> “Does this make the trader calmer or more anxious?”

If anxious → redesign.

> “Does this encourage reflection or reaction?”

If reaction → remove.

> “Is this behavior-aligned or performance-aligned?”

If performance → rethink.

---

## 12. Naming Conventions (Optional Guidance)

Good component names:

* `BehavioralReminder`
* `RiskComfortSelector`
* `ConfidenceScale`
* `CoachingNudgeCard`

Avoid:

* `ProfitSummary`
* `PerformanceChart`
* `TradeOptimizer`

---

## Final Instruction to AI

**This product is a mirror, not a scoreboard.**
Build with restraint, empathy, and clarity.

---

## Branding Hygiene

* Use the product name **MindfulTrade** everywhere (titles, meta tags, copy).
* Remove/avoid vendor or template branding (e.g., Lovable) in code and docs.
* Keep language calm and reflective; no hype or urgency.

---

## 13. Trading Rules & Guardrails Philosophy

### Core Principle

Trading rules are **self-defined commitments**, not system-enforced restrictions.

The system must always remind users:

> "This is a rule you set for yourself"

### Implementation Rules

**Rules are NEVER enforced** — only surfaced and reminded.

The UI must never:

* Disable trading actions
* Prevent users from taking trades
* Block or restrict functionality
* Use fear-based language
* Show judgmental messages

### Nudge Language (Calm & Respectful)

When approaching limits:

* "You're approaching a guardrail you defined."
* "You're close to a limit you set for today."

When limits are reached:

* "You've reached a limit you set to protect yourself."
* "This trade may exceed your daily risk comfort."

**Never use:**

* "You violated your rule"
* "You broke your limit"
* "Trading blocked"
* "Action denied"

### Visual Design for Rules

* **Safe** → Neutral colors, calm indicators
* **Warning** → Subtle amber/yellow, gentle reminder
* **Breached** → Muted red (not alarming), respectful message

Status indicators should feel like a **seatbelt reminder**, not a speed limiter.

### Rule Types (v1)

1. **Daily Loss Limit** — Percentage or absolute amount
2. **Losing Trades Limit** — Maximum losing trades per day
3. **Daily Target Limit** — Stop trading after target reached
4. **Stop Conditions** — Auto-stop after loss/target

Each rule must:

* Be user-defined
* Have clear, simple descriptions
* Show live status without blocking
* Allow toggling on/off

### Profile Data (Lightweight)

Collect only:

* First name
* Trading experience level
* Account size
* Trading style

Purpose: Personalize rules and future nudges. No psychology tests or complex onboarding.

---

## Final Instruction to AI

**This product is a mirror, not a scoreboard.**
Build with restraint, empathy, and clarity.

**Trading rules are seatbelts, not speed limiters.**
They protect during emotional moments, but never control.
