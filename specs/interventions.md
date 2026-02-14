# Behavioral Interventions

## Overview

When a user navigates to a blocked site during a focus session, they see an **intervention page** instead of the site content. Inspired by QUITTR's approach, the intervention page is not just a wall — it's a multi-tool designed to help the user manage the urge in the moment and return to focused work.

The core philosophy: **blocking prevents access, but interventions change behavior.**

---

## Intervention Page Design

### Page Structure

The blocked page is a full-tab experience with multiple sections, presented as a vertical flow:

```
┌─────────────────────────────────────────────┐
│                                             │
│         🛡️  [Site] is blocked               │
│         "You started this for a reason."     │
│                                             │
│         ┌─────────────────────────┐         │
│         │   Session Timer          │         │
│         │   42:18 remaining        │         │
│         └─────────────────────────┘         │
│                                             │
│    ┌──────────────────────────────────┐     │
│    │  YOUR REASON                      │     │
│    │  "I want to be more present       │     │
│    │   with my family in the evenings" │     │
│    └──────────────────────────────────┘     │
│                                             │
│    ┌─────────┐  ┌─────────┐  ┌──────────┐  │
│    │ Breathe │  │ Reflect │  │ Stats    │  │
│    └─────────┘  └─────────┘  └──────────┘  │
│                                             │
│         ┌─────────────────────────┐         │
│         │   Your streak: 12 days   │         │
│         │   Don't break it now.    │         │
│         └─────────────────────────┘         │
│                                             │
│    [ Go back to work ]                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Intervention Tools

### 1. Motivational Header

**Purpose:** Immediate pattern interruption — break the autopilot of navigating to the site.

- Shows the blocked domain name prominently
- Rotating motivational messages (not the same one every time):
  - "You started this session for a reason."
  - "Is this really what you want to be doing right now?"
  - "Your future self will thank you."
  - "You don't need this. You need what you were working on."
  - "Every time you resist, it gets easier."

### 2. Personal Reason Display

**Purpose:** Self-confrontation — remind the user of their own stated motivation.

- During onboarding (or in settings), users write **why** they want to block these sites
- This reason is displayed prominently on the intervention page
- Seeing their own words is more powerful than generic messaging
- If no reason is set, prompt them to write one: "Why did you start this session?"

**Storage:** `chrome.storage.sync` under `personalReason` (string)

### 3. Breathing Exercise

**Purpose:** Physiological calming — reduce the arousal/urge state.

QUITTR uses guided breathing to activate the parasympathetic nervous system. We implement a simple animated breathing guide:

- **Box breathing pattern:** Inhale 4s → Hold 4s → Exhale 4s → Hold 4s
- Visual animation: expanding/contracting circle with text prompts
- Duration: ~2 minutes (3 full cycles)
- After completion: "Feeling calmer? Go back to what matters." with a button to navigate away

### 4. Reflection Prompt

**Purpose:** Cognitive engagement — make the user think instead of act impulsively.

Quick journaling-style prompt that appears when the user clicks "Reflect":

- "What triggered you to come here right now?"
- "What were you doing before you navigated here?"
- "On a scale of 1-10, how strong is the urge right now?"

Responses are stored locally (and optionally synced to dashboard). They help users identify patterns in their triggers over time.

**Storage:** `chrome.storage.local` under `reflections[]`

```typescript
interface Reflection {
  timestamp: number;
  domain: string;         // Which blocked site triggered this
  prompt: string;         // Which question was shown
  response: string;       // User's text response
  urgeLevel?: number;     // 1-10 if that prompt was shown
}
```

### 5. Stats Snapshot

**Purpose:** Loss aversion — show what they'd be throwing away.

Quick glance at progress directly on the intervention page:

- Current streak: "12 days focused"
- Session progress: "You're 65% through this session"
- Today's blocked attempts: "You've resisted 3 times today"
- Time saved this week: "4h 23m saved from distracting sites"

### 6. Streak Warning

**Purpose:** Loss aversion reinforcement.

If the user has an active streak, show it prominently with emotional framing:
- "Your 12-day streak is alive. Breaking this session ends it."
- For long streaks (7+ days): additional emphasis, perhaps a visual of the streak timeline

### 7. "Go Back to Work" Button

**Purpose:** Easy positive exit path.

- Prominent, styled as the primary action
- Navigates to `about:blank` or closes the tab (user preference)
- Records this as `outcome: "stayed"` in the interruption log

---

## What's NOT on the Intervention Page

### No "Break Block" mechanism

v1 allowed users to pay $1 to break the block. v2 removes this entirely. The session can only end by:
1. Timer expiring naturally
2. User manually ending from the popup (which is tracked and counts against completion rate)

The blocked page itself has **no way to end the session**. This is intentional — putting the escape hatch on the intervention page undermines the intervention.

### No shaming or negative messaging

Avoid guilt-based messaging. The tone is supportive, not punitive:
- "You're stronger than this urge" (not "You're wasting your life")
- "Every time you resist, it gets easier" (not "You're failing again")
- Focus on progress, not shame

---

## Intervention Analytics

Every interaction on the intervention page is logged for the dashboard:

| Event | Data |
|-------|------|
| Page viewed | timestamp, domain, session progress % |
| Breathing exercise started | timestamp |
| Breathing exercise completed | timestamp, duration |
| Reflection submitted | timestamp, prompt, response |
| "Go back to work" clicked | timestamp |
| Time spent on intervention page | duration (seconds) |

This data feeds into dashboard analytics:
- "You used breathing exercises 8 times this week, and stayed focused 7 of those times"
- "Your most tempting site is YouTube — you've been redirected 23 times this month"
- "Average time on intervention page before going back to work: 45 seconds"

---

## Future Intervention Ideas

These are not in scope for v2 MVP but worth considering:

| Feature | Description | QUITTR Equivalent |
|---------|-------------|-------------------|
| Accountability partner | Share your stats with a trusted person who gets notified on slip-ups | Accountability feature |
| Community challenges | "Block YouTube for 7 days" group challenge | Community leaderboards |
| Urge log | Structured urge tracking with intensity, trigger, and time of day | AI Therapist (simplified) |
| Replacement activity suggestions | "Instead of scrolling, try: 5 pushups / read 2 pages / drink water" | QuitCoins mini-games |
| Self-confrontation via webcam | Camera activation showing user's face (like QUITTR's panic button) | Not feasible in extension context |
