# API Reference

## Base URL

- **Development:** `http://localhost:8080`
- **Configurable via:** `VITE_API_URL` environment variable (client), `PORT` environment variable (server)

## CORS

All endpoints include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
Preflight `OPTIONS` requests return 200 with no body.

---

## Endpoints

### POST `/create-checkout-session`

Creates a Stripe Checkout session for a $1 "break block" payment.

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_a1b2c3...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3..."
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 500 | Stripe session creation fails |
| 500 | DynamoDB write fails |
| 500 | Request body unreadable / invalid JSON |

**Side Effects:**
- Creates a Stripe Checkout Session
- Inserts a `Payment` record in DynamoDB with `paid: false`

---

### POST `/webhook`

Receives Stripe webhook events. Called by Stripe, not by the client.

**Request:** Raw Stripe event payload with `Stripe-Signature` header.

**Handled Events:**
- `checkout.session.completed` — marks payment as paid in DynamoDB

**Response:**
| Status | Condition |
|--------|-----------|
| 200 | Event processed successfully |
| 400 | Failed to read body or construct event |

**Side Effects:**
- Updates `Payment` record: sets `paid = true`

---

### GET `/check-payment`

Checks whether a specific payment has been completed.

**Query Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `session_id` | Yes | Stripe Checkout session ID |

**Response (200):**
```json
{
  "paid": true
}
```
or
```json
{
  "paid": false
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | Missing `session_id` parameter |
| 500 | DynamoDB read fails |

---

### GET `/user-stats`

Returns aggregate payment statistics for a user.

**Query Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `user_id` | Yes | User UUID |

**Response (200):**
```json
{
  "totalSpent": 300,
  "totalPayments": 3
}
```

- `totalSpent` is in cents (300 = $3.00)
- `totalPayments` counts only payments where `paid = true`

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | Missing `user_id` parameter |
| 500 | DynamoDB scan fails |

**Note:** This endpoint uses a full DynamoDB table scan. See [bugs.md](./bugs.md#bug-004).

---

### GET `/health`

Health check endpoint.

**Response (200):**
```
OK
```

---

## Chrome Extension Message Protocol

Internal messages between extension contexts, sent via `chrome.runtime.sendMessage`.

### `START_SESSION`
```typescript
// Request
{ type: "START_SESSION", duration: number, sites: string[] }
// duration: minutes
// sites: array of domain strings (e.g., ["x.com", "twitter.com"])

// Response: void (session starts asynchronously)
```

### `END_SESSION`
```typescript
// Request
{ type: "END_SESSION" }

// Response: void (session ends asynchronously)
```

### `GET_SESSION`
```typescript
// Request
{ type: "GET_SESSION" }

// Response
{
  session: {
    isActive: boolean,
    endsAt: number,       // Unix timestamp in milliseconds
    blockedSites: string[]
  } | null
}
```

---

## Error Handling

The server returns plain JSON error objects:
```json
{
  "error": "description of what went wrong"
}
```

There is no standardized error format. Some errors are returned as plain text via `http.Error()`.
