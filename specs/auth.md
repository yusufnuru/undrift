# Authentication & Authorization

## Current State

**There is no authentication system.** Identity is handled via anonymous client-generated UUIDs.

### How It Works Now

1. On first use, the extension calls `crypto.randomUUID()` to generate a UUID
2. The UUID is stored in `chrome.storage.sync` (persists across Chrome profile sync)
3. The UUID is sent as `userId` in payment requests
4. The server trusts it blindly — no validation, no signing, no verification

### Code Locations

| File | Role |
|------|------|
| `client/src/utils/userId.ts` | Generates and persists UUID |
| `client/src/blocked/Blocked.tsx` | Sends `userId` to backend |
| `server/main.go` | Receives `userId`, stores in DynamoDB |

---

## Security Gaps

### 1. User Impersonation
Anyone who knows (or guesses) a UUID can make API calls on behalf of that user. UUIDs are v4 random, so brute-force is impractical, but the system still has no verification.

### 2. User Stats Exposure
The `/user-stats?user_id=<uuid>` endpoint returns payment history for any UUID without authentication. If a UUID leaks, their spending data is exposed.

### 3. No Server-Side Session
The server has no concept of "logged in." Every request is treated independently. There is no way to revoke access or invalidate a user.

### 4. No CSRF Protection
No CSRF tokens. Combined with `Access-Control-Allow-Origin: *`, any website can trigger API calls.

---

## Recommendations

### Option A: Keep Anonymous but Sign Requests
If accounts aren't desired, the extension could generate a keypair and sign requests. The server would verify signatures. This prevents impersonation without requiring login.

### Option B: Chrome Identity API
Use `chrome.identity` to authenticate via Google OAuth. This provides a verified identity without building a login system. The server validates the Google token.

### Option C: Full Auth System
Implement email/password or OAuth login with JWT tokens. Overkill for the current scope but provides the strongest guarantees.

### Minimum Viable Improvements
Regardless of auth strategy:
1. **Restrict CORS** to the extension's origin (`chrome-extension://<id>`)
2. **Require Stripe webhook signatures** — never process unsigned webhooks
3. **Rate limit** all endpoints by IP
4. **Validate `userId` format** — at minimum confirm it's a valid UUID
