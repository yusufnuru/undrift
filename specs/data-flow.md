# Data Flow

## Session Lifecycle Flows

### 1. Start Focus Session

```
User (Popup)
  │
  │ Selects sites + clicks duration button
  │
  ▼
Popup.tsx
  │
  │ chrome.runtime.sendMessage({ type: "START_SESSION", duration, sites })
  │
  ▼
Background Service Worker
  │
  ├─► chrome.storage.local.set({ session: { isActive, endsAt, blockedSites, sessionId } })
  │
  ├─► chrome.declarativeNetRequest.updateDynamicRules({ addRules: [...] })
  │     Creates one redirect rule per blocked domain
  │
  ├─► chrome.tabs.query({}) → redirect matching tabs to intervention page
  │
  ├─► chrome.alarms.create("sessionEnd", { when: endsAt })
  │
  └─► chrome.alarms.create("session-warning", { when: endsAt - 5min })
```

### 2. User Navigates to Blocked Site

```
User types blocked URL in browser
  │
  ▼
Chrome (declarativeNetRequest engine)
  │
  │ Matches URL against dynamic rules
  │ Redirects main_frame request
  │
  ▼
Intervention Page (src/blocked/index.html?returnUrl=<original_url>)
  │
  ├─► Reads returnUrl from query params
  ├─► Gets session info via chrome.runtime.sendMessage({ type: "GET_SESSION" })
  ├─► Gets streak data via chrome.runtime.sendMessage({ type: "GET_STREAK" })
  ├─► Gets personal reason from chrome.storage.sync
  │
  ▼
User sees: Intervention page with motivational tools
  │
  ├─► Records interruption: { timestamp, domain, outcome: "pending" }
  │     via chrome.runtime.sendMessage({ type: "LOG_INTERRUPTION", domain })
  │
  ├─► (Optional) User uses breathing exercise → log interaction
  ├─► (Optional) User submits reflection → log to chrome.storage.local
  │
  └─► User clicks "Go back to work"
        └─► Update interruption outcome to "stayed"
        └─► Navigate to about:blank or close tab
```

### 3. Passive Time Tracking

```
User browses normally (no active focus session required)
  │
  ▼
Background Service Worker (event listeners registered at top level)
  │
  ├─► chrome.tabs.onActivated → { tabId, windowId }
  │     └─► chrome.tabs.get(tabId) → { url }
  │         └─► Stop timer for previous domain
  │             Save elapsed time to chrome.storage.local
  │             Start timer for new domain
  │
  ├─► chrome.tabs.onUpdated (filter: changeInfo.url)
  │     └─► Same as tab switch — stop old timer, start new
  │
  ├─► chrome.windows.onFocusChanged
  │     └─► If WINDOW_ID_NONE: stop current timer (Chrome lost focus)
  │     └─► If valid window: resume tracking active tab in that window
  │
  ├─► chrome.idle.onStateChanged
  │     └─► "idle" or "locked": stop current timer
  │     └─► "active": resume tracking current active tab
  │
  └─► chrome.alarms "heartbeat" (every 30 seconds)
        └─► Calculate elapsed since current.startedAt
            Add to daily[today][domain] in chrome.storage.local
            Reset startedAt to now
            Check time alert thresholds → fire notifications if crossed
```

### 4. Session Ends (Timer Expires)

```
Chrome alarm fires ("sessionEnd")
  │
  ▼
Background Service Worker
  │
  ├─► chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [...] })
  │
  ├─► chrome.tabs.query({}) → find tabs on intervention page → navigate to returnUrl
  │
  ├─► chrome.storage.local: update session record
  │     └─► endedAt: Date.now(), endReason: "timer", completed: true
  │
  ├─► Update streak data
  │     └─► If no completed session today yet → increment currentStreak
  │     └─► Update lastCompletedDate
  │
  ├─► chrome.notifications.create("session-complete", {
  │     title: "Focus session complete!",
  │     message: "You stayed focused for 2 hours. Streak: 12 days."
  │   })
  │
  └─► Queue data sync (if authenticated)
```

### 5. Manual Session End

```
User clicks "End Session" in Popup
  │
  ▼
Popup.tsx
  │
  │ chrome.runtime.sendMessage({ type: "END_SESSION" })
  │
  ▼
Background Service Worker
  │
  ├─► (Same cleanup as timer expiry: remove rules, restore tabs)
  │
  ├─► chrome.storage.local: update session record
  │     └─► endedAt: Date.now(), endReason: "manual", completed: false
  │
  └─► Streak is NOT updated (manual end doesn't count as completion)
```

### 6. Extension / Browser Restart

```
chrome.runtime.onStartup fires (browser cold start)
  │
  ▼
Background Service Worker
  │
  ├─► Re-create heartbeat alarm if missing
  │     chrome.alarms.get("heartbeat") → if null → chrome.alarms.create(...)
  │
  ├─► chrome.storage.local.get("session")
  │
  ├─► If session.isActive && session.endsAt > Date.now():
  │     └─► Re-enable blocking rules (they persist, but verify)
  │         Re-set alarm for remaining duration
  │         Resume time tracking
  │
  ├─► If session.endsAt <= Date.now():
  │     └─► Session expired while browser was closed
  │         Clean up session, mark as completed (endReason: "browser_closed")
  │         Update streak
  │
  └─► Resume passive time tracking for current active tab
```

### 7. Dashboard Data Sync

```
Background Service Worker (triggered by alarm or session end)
  │
  ├─► Check auth token in chrome.storage.sync
  │     └─► If no token: skip sync (user not logged in)
  │
  ├─► Gather data since last sync:
  │     • New time tracking entries
  │     • New/updated session records
  │     • Updated streak data
  │
  ├─► POST /api/sync {
  │     timeTracking: { daily entries since lastSyncedAt },
  │     sessions: [ new sessions since lastSyncedAt ],
  │     streak: { current streak data }
  │   }
  │     Headers: { Authorization: "Bearer <jwt>" }
  │
  ├─► On success: update lastSyncedAt in chrome.storage.local
  │
  └─► On failure (401): clear auth token, user needs to re-authenticate
      On failure (network): retry on next sync cycle
```

### 8. Notification Flows

```
Time Alert:
  heartbeat alarm fires
    └─► Check daily[today][currentDomain] >= threshold
        └─► If threshold not yet alerted today:
            chrome.notifications.create(...)
            Record in notificationState

Streak at Risk:
  streak-check alarm fires (daily at 8 PM)
    └─► Check if any completed session today
        └─► If no AND currentStreak > 0:
            chrome.notifications.create(...)

Session Warning:
  session-warning alarm fires (5 min before end)
    └─► chrome.notifications.create(...)
```

---

## Data Storage Map

```
┌───────────────────────────────────────────────────────────────────┐
│                         Client Side                               │
│                                                                   │
│  chrome.storage.sync (cross-device)                               │
│  ┌────────────────────────────────────────────────┐               │
│  │ userId: UUID                                    │               │
│  │ authToken: JWT (if logged in)                   │               │
│  │ personalReason: string                          │               │
│  │ notificationSettings: NotificationSettings      │               │
│  └────────────────────────────────────────────────┘               │
│                                                                   │
│  chrome.storage.local (device-only)                               │
│  ┌────────────────────────────────────────────────┐               │
│  │ session: { isActive, endsAt, blockedSites,     │               │
│  │            sessionId, interruptions[] }         │               │
│  │ selectedPresets: string[]                       │               │
│  │ customSites: string[]                           │               │
│  │ timeTracking: { daily: {...}, current: {...} }  │               │
│  │ sessionHistory: { sessions[], lastSyncedAt }    │               │
│  │ streak: { currentStreak, longestStreak,         │               │
│  │           lastCompletedDate, streakStartDate }  │               │
│  │ reflections: Reflection[]                       │               │
│  │ notificationState: { ... dedup tracking }       │               │
│  └────────────────────────────────────────────────┘               │
│                                                                   │
│  chrome.declarativeNetRequest (managed by Chrome)                 │
│  ┌────────────────────────────────────────────────┐               │
│  │ Dynamic rules: redirect rules per domain       │               │
│  └────────────────────────────────────────────────┘               │
│                                                                   │
│  chrome.alarms (managed by Chrome)                                │
│  ┌────────────────────────────────────────────────┐               │
│  │ "sessionEnd"      — focus session timer         │               │
│  │ "session-warning" — 5 min before session end    │               │
│  │ "heartbeat"       — 30-second tracking persist  │               │
│  │ "streak-check"    — daily at 8 PM               │               │
│  │ "daily-reminder"  — user-configured time         │               │
│  │ "sync"            — periodic server sync         │               │
│  └────────────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                         Server Side                               │
│                                                                   │
│  Database (PostgreSQL or DynamoDB)                                │
│  ┌────────────────────────────────────────────────┐               │
│  │ users: { id, email, created_at }               │               │
│  │ time_tracking: { user_id, date, domain, secs } │               │
│  │ sessions: { user_id, session_id, started_at,   │               │
│  │             ended_at, duration, sites,          │               │
│  │             interruptions, end_reason }         │               │
│  │ streaks: { user_id, current, longest, ... }    │               │
│  │ settings: { user_id, preferences JSON }        │               │
│  └────────────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────────┘
```
