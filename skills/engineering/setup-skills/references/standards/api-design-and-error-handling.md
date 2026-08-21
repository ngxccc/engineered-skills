# API Design & Error Handling Standards

## 1. RESTful URL & Route Naming Conventions

- **Resource-Oriented & Plural Nouns**: Routes MUST use plural nouns in lowercase `kebab-case` (`/api/v1/movies`, `/api/v1/cinemas/:cinemaId/halls`).
- **Command vs Query Distinction**:
  - State retrieval (Safe, Idempotent): `GET /api/v1/shows/:id`
  - Resource creation: `POST /api/v1/shows`
  - High-intent Business Actions (Commands): Use sub-action nouns (`POST /api/v1/bookings/reserve`).

---

## 2. Standard Response Envelope

All successful JSON responses MUST adhere to the generic `ApiResponseDto` envelope:

```json
{
  "success": true,
  "data": { "id": "019fa8bc-8f4d-7000-b366-e691f45cfb91", "status": "active" },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

---

## 3. RFC 9457 Problem Details for Error Responses

All error responses across HTTP exceptions and validation failures MUST follow **RFC 9457**:

- **Content-Type**: `application/problem+json`
- **Structure**: `{ type, title, status, detail, instance, invalidParams? }`

---

## 4. HTTP Status Code Decision Matrix

| Status Code             | Meaning                  | When to Use                                                   |
| :---------------------- | :----------------------- | :------------------------------------------------------------ |
| `200 OK`                | Success with payload     | Successful `GET`, `PUT`, `PATCH`, or idempotent state update. |
| `201 Created`           | Resource created         | Successful `POST` creating an entity.                         |
| `400 Bad Request`       | Client syntax error      | DTO validation failure, malformed JSON, missing headers.      |
| `401 Unauthorized`      | Missing / Invalid Auth   | Bearer token missing, expired, revoked, or signature invalid. |
| `403 Forbidden`         | Insufficient Permissions | User lacks Role (RBAC) or account suspended.                  |
| `404 Not Found`         | Entity Missing           | Non-existent UUID or missing route.                           |
| `409 Conflict`          | State Conflict           | Concurrent seat race, schedule overlap, unique key collision. |
| `422 Unprocessable`     | Business Rule Violation  | Valid syntax but impossible domain action.                    |
| `429 Too Many Requests` | Rate Limit Exceeded      | Throttler triggered limit.                                    |
| `500 Internal Error`    | Server Crash             | Sanitized error response; details logged privately.           |

---

## 5. Idempotency Key Handling

- **Header**: `Idempotency-Key: <UUIDv4 / UUIDv7>`
- Mutating operations MUST cache the response in Redis (24h TTL) to ensure safe retries.
