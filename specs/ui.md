# UI Specification

## Overview

The UI consists of three surfaces:

1. **Extension Popup** — Chrome toolbar popup for session management
2. **Intervention Page** — Full-tab page when visiting a blocked site
3. **Dashboard** — Web app for analytics and progress tracking (see [dashboard.md](./dashboard.md))

---

## 1. Popup (`src/popup/Popup.tsx`)

The popup appears when the user clicks the extension icon in the Chrome toolbar.

### States

#### Idle State (No Active Session)

- **Header**
  - App name/logo
  - Current streak badge: "12-day streak" (or "Start a streak" if 0)
  - Quick stat: today's tracked screen time

- **Site Selection Grid**
  - 6 preset site buttons in a 2-column grid:
    - X/Twitter, Instagram, YouTube, Twitch, Reddit, TikTok
  - Each button toggles on/off (visual highlight when selected)
  - Selection persists in `chrome.storage.local` under `selectedPresets`

- **Custom Sites Section**
  - Text input for custom domain entry (placeholder: "e.g., facebook.com")
  - "Add" button to append to custom sites list
  - Displayed as removable tags/chips below the input
  - Custom sites persist in `chrome.storage.local` under `customSites`

- **Duration Buttons**
  - Row of 4 buttons: `1 min`, `1 hr`, `1.5 hr`, `2 hr`
  - Clicking a duration immediately starts the session
  - Buttons disabled if no sites are selected

- **Footer**
  - "Open Dashboard" link (opens dashboard in new tab)
  - Settings gear icon

#### Active Session State

- **Session Header**
  - "Focus session active" with pulsing indicator
  - Streak badge

- **Countdown Timer**
  - Large formatted display: `H:MM:SS` or `M:SS`
  - Updates every 1 second
  - Circular progress ring showing session completion %

- **Session Stats**
  - Sites blocked: list of domains
  - Interruptions resisted: count of `outcome: "stayed"` this session
  - "You're doing great" or similar encouragement

- **End Session Button**
  - Destructive styled button (red/warning)
  - Confirmation: "Are you sure? This won't count toward your streak."

### Dimensions

- Standard Chrome extension popup (max ~400px wide, variable height)

---

## 2. Intervention Page (`src/blocked/Blocked.tsx`)

Full-page redirect when visiting a blocked site during a focus session. This replaces the v1 "pay $1 to break" page.

### URL Handling

- Receives the original URL via query parameter: `?returnUrl={encoded_url}`
- Extracts and displays the hostname

### Layout

Vertical full-page layout with centered content. Dark theme (#0f0f0f background).

#### Section 1: Header

- Shield/block icon
- Large text: "[Site] is blocked"
- Rotating motivational subheading (randomized from pool)

#### Section 2: Session Timer

- Remaining session time in large format: `M:SS`
- Session progress bar or ring showing % complete
- "X minutes left — you've got this"

#### Section 3: Personal Reason

- Card displaying user's stated reason for focusing
- If no reason set: "Why did you start this session?" with inline input to set one
- Stored in `chrome.storage.sync` under `personalReason`

#### Section 4: Intervention Tools (Expandable Cards)

Three tool cards in a row:

**Breathe**
- Expandable card with animated breathing guide
- Box breathing: 4s inhale → 4s hold → 4s exhale → 4s hold
- Animated circle expanding/contracting
- Timer showing exercise duration
- "Complete" state after 3 cycles (~2 minutes)

**Reflect**
- Expandable card with journaling prompt
- Random prompt from pool:
  - "What triggered you to come here right now?"
  - "What were you doing before this?"
  - "On a scale of 1-10, how strong is the urge?"
- Text input area for response
- Submit button saves to `chrome.storage.local`

**Stats**
- Expandable card with quick stats:
  - Current streak: "12 days"
  - Today's interruptions: "Resisted 3 times"
  - Session progress: "65% complete"
  - Time saved this week: "4h 23m"

#### Section 5: Streak Warning

- Only shown if user has active streak (>= 1 day)
- "Your 12-day streak is alive. Stay focused."
- For long streaks (7+): more prominent styling

#### Section 6: Action Buttons

- **Primary:** "Go back to work" → navigates away (about:blank or closes tab)
- No "break block" or "end session" button — session can only be ended from the popup

### States

| State | Trigger | Display |
|-------|---------|---------|
| Default | Page load during active session | Full intervention page |
| Breathing | User expands "Breathe" card | Animated breathing exercise |
| Reflecting | User expands "Reflect" card | Journal prompt + input |
| Session ended | Timer reaches 0 or session ended from popup | "Session ended" + redirect |
| No session | No active session (direct URL access) | Redirect to original URL |

---

## 3. Settings Page (New)

Accessible from popup footer or dashboard. Can be an extension options page or a popup sub-view.

### Sections

- **Notification Preferences**
  - Master toggle: enable/disable all notifications
  - Time alerts: toggle + threshold slider (15/30/60 min)
  - Session reminders: toggle + warning time
  - Streak alerts: toggle + evening reminder time
  - Daily reminder: toggle + time picker

- **Personal Reason**
  - Text input to set/edit the motivational reason
  - Preview of how it appears on the intervention page

- **Account**
  - Login/logout status
  - Email display
  - "Open Dashboard" link
  - Last sync time

- **Data**
  - Export data (JSON download)
  - Clear local data (with confirmation)

---

## 4. User Flows

### Flow 1: Start a Focus Session

```
Open popup
  → See current streak and today's stats
  → Select sites (presets and/or custom)
  → Click duration button
  → Session starts
  → Popup shows countdown + session stats
  → Close popup
```

### Flow 2: Hit a Blocked Site

```
Navigate to blocked site
  → Redirected to intervention page
  → See motivational messaging + personal reason
  → See session timer + streak warning
  → (Optional) Use breathing exercise
  → (Optional) Submit reflection
  → Click "Go back to work"
  → Redirected away from blocked site
```

### Flow 3: End Session Manually

```
Open popup during active session
  → See countdown
  → Click "End Session"
  → Confirmation prompt ("This won't count toward your streak")
  → Confirm → All blocking removed, tabs restored
```

### Flow 4: View Dashboard

```
Click "Open Dashboard" in popup (or navigate to URL)
  → Login (if not authenticated)
  → See overview: streak, today's stats, weekly trend
  → Navigate to Time Tracking, Sessions, or Streaks pages
```

### Flow 5: First-Time Setup

```
Install extension
  → Open popup
  → Set personal reason (prompted or in settings)
  → Select sites to block
  → Start first session
  → (Optional) Create account to enable dashboard sync
```

---

## 5. Visual Design

### Theme

- Dark theme (deep obsidian palette: `#08080c` void, `#0c0c12` primary, `#121219` elevated)
- Accent colors: ember/amber (`#f59e0b`) for primary actions and streaks, green (`#34d399`) for success, blue (`#818cf8`) for info, red (`#fb7185`) for warnings
- Glass-morphism cards with backdrop blur and subtle borders
- Noise texture overlay on body for depth
- Clean, minimal aesthetic

### Typography

- Body: DM Sans (Google Fonts)
- Display/headings: Instrument Serif (Google Fonts) — used for streak numbers, page titles, stat values
- Large, readable timer displays

### Styling

- **Popup & Intervention page**: Hand-written CSS (`popup.css`, `blocked.css`)
- **Dashboard**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Custom theme tokens defined in `dashboard.css` using `@theme` block. Components use Tailwind utility classes inline. A small set of custom CSS handles pseudo-elements (noise overlay, sidebar glow, streak glow, toggle switch) and animation keyframes (`@utility` directives).

### Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast ratios
- Screen reader friendly timer announcements
