# Testing

## Current State

**There are no tests.** No unit tests, integration tests, or end-to-end tests exist for either the client or server.

---

## What Should Be Tested

### Server (Go)

#### Unit Tests

| Function | What to Test |
|----------|-------------|
| `handleCreateCheckoutSession` | Valid request creates session; missing userId returns error; Stripe failure handled |
| `handleWebhook` | Valid signed event processes correctly; invalid signature rejected; unsigned events rejected when secret is set |
| `handleCheckPayment` | Returns paid status; missing session_id returns 400; unknown session handled |
| `handleUserStats` | Aggregates correctly; missing user_id returns 400; empty results return zeros |
| `savePayment` | Marshals and puts item correctly |
| `markPaymentPaid` | Updates correct item |
| `checkPaymentPaid` | Returns correct boolean; handles missing items |
| `getPaymentsByUser` | Filters correctly; handles empty results |
| `enableCORS` | Sets correct headers; handles OPTIONS preflight |

#### Integration Tests

- Full checkout flow: create session → webhook → check payment
- DynamoDB operations against local DynamoDB (via Docker)
- Stripe operations against test mode API

### Client (TypeScript/React)

#### Unit Tests

| Component/Module | What to Test |
|------------------|-------------|
| `Popup.tsx` | Renders preset buttons; toggles selection; starts session; shows timer; ends session |
| `Blocked.tsx` | Displays blocked site; initiates payment; polls status; handles payment success |
| `api.ts` | Correct URL construction; proper request/response handling; error handling |
| `userId.ts` | Generates UUID on first call; returns cached UUID on subsequent calls |
| `background/index.ts` | Session start/end lifecycle; rule creation; tab management; alarm handling |

#### E2E Tests

- Full session lifecycle: select sites → start session → verify blocking → end session
- Payment flow (with Stripe test mode)
- Extension install/restart recovery

---

## Recommended Testing Stack

### Server
- **Framework:** Go's built-in `testing` package
- **Mocking:** Interfaces for DynamoDB and Stripe clients for dependency injection
- **Local DynamoDB:** `amazon/dynamodb-local` Docker image
- **Stripe Test Mode:** Use Stripe test API keys and test card numbers

### Client
- **Unit Tests:** Vitest (already compatible with Vite setup)
- **Component Tests:** React Testing Library
- **E2E:** Playwright or Puppeteer with Chrome extension testing support
- **Chrome API Mocking:** `jest-chrome` or manual mocks for `chrome.*` APIs

---

## Test Infrastructure Needed

1. **Server refactoring:** Extract DynamoDB and Stripe clients into interfaces for testability. Currently everything is in `main.go` with package-level variables.

2. **Client test setup:** Add Vitest config, mock `chrome.*` APIs, set up component rendering.

3. **CI pipeline:** Neither CI configuration nor test scripts exist. Need GitHub Actions (or similar) for automated testing.

4. **Stripe test fixtures:** Create test webhook payloads for different event types.

---

## Priority

| Priority | Area | Rationale |
|----------|------|-----------|
| 1 | Webhook handler tests | Financial integrity — must verify payments correctly |
| 2 | Payment flow integration | End-to-end money flow must be correct |
| 3 | Session lifecycle | Core feature — blocking must be reliable |
| 4 | API input validation | Security — prevent malformed requests |
| 5 | UI component tests | Lower risk — visual bugs are noticeable |
