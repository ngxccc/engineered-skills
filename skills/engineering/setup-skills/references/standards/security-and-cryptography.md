# Security & Cryptography Standards

## 1. Password Hashing (Scrypt)

- Parameters: $N=16384$, $r=8$, $p=1$, key length $=64\text{ bytes}$, salt $=16\text{ bytes}$.
- Stored format: `salt:derivedKey` (Hex).

---

## 2. Constant-Time Comparison (Timing Attack Defense)

- **RULE**: NEVER use `===` or `==` for hash, HMAC, or token comparisons.
- **MANDATORY**: Use `crypto.timingSafeEqual` with strict length guard:

```ts
if (derivedKey.length !== keyBuffer.length) return false;
return timingSafeEqual(derivedKey, keyBuffer);
```

---

## 3. JWT & Refresh Token Lifecycle

- **Access Token**: 15-minute TTL, stateless, stored in client memory.
- **Refresh Token**: 7-day TTL, stored in DB as SHA-256 hash.
- **Single-Use Rotation**: Each refresh invalidates previous token and issues new pair.
- **Global Session Revocation**: Password change / `/auth/logout-all` deletes all active refresh tokens.

---

## 4. XSS Sanitization

- **Global Pipe**: `whitelist: true`, `forbidNonWhitelisted: true`.
- **DOMPurify / Sanitize-HTML**: Strip all `<script>` tags, event handlers, and `javascript:` URIs before persistence.

---

## 5. Anti-Replay & Anti-Enumeration

- **Webhook HMAC**: Verify raw body signature via provider checksum key.
- **Anti-Replay Window**: Reject webhook timestamps older than 5 minutes.
- **User Enumeration Protection**: Public endpoints (`/auth/forgot-password`) return generic `200 OK` regardless of email existence.
