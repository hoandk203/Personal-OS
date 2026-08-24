# Security

Read before: any endpoint that reads someone else's data, any file access, any integration that
stores a credential, any webhook.

## Already in place — don't re-add

Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), global `ThrottlerGuard`
(`ttl 60_000`, `limit 30`), CORS with `credentials: true` bound to `WEB_URL`, `cookieParser`,
`JwtAuthGuard` + `RolesGuard`, `bcryptjs` at 12 rounds behind `BcryptHashingService`,
`EncryptionService` for integration tokens, `redact()` for logs.

## Known gaps — flag, don't silently fix

| Gap | Note |
| --- | --- |
| **Helmet not installed** | No security headers middleware in `main.ts`. Propose it as its own change. |
| **No env validation schema** | `ConfigModule.forRoot()` has no `validationSchema`. A missing `JWT_SECRET` or `INTEGRATION_ENCRYPTION_KEY` fails at first use, not at boot. Worth adding; ask first. |
| **Throttle is one global tier** | 30 req/min applies equally to a login attempt and a list call. Auth endpoints deserve a tighter `@Throttle()`. |

## Authorization is the main risk surface here

This is a multi-tenant-ish app: division leaders, mentors, and learners all hit the same endpoints
and must see different rows. **Broken object-level authorization (IDOR) is the most likely serious
bug you can introduce.** Checklist for every read or mutation of an identified resource:

1. Does a guard restrict the **role**? (`@Roles(...)`)
2. Does the use-case restrict the **rows**? (`resolveScope` / an explicit ownership check)
3. Does `resolveScope() === null` short-circuit to an **empty result**, never an unfiltered query?
4. If the actor is a learner, is a client-supplied `userId` **overridden** with `actor.id` rather
   than trusted?
5. On a 404-vs-403 decision: return **404** for rows outside the actor's scope, so the endpoint
   doesn't confirm that an id exists.

Never rely on the UI hiding a button. `RouteGuard` in the web client is a convenience redirect, not
a control.

## Secrets

- Integration credentials (Slack bot tokens, ChatWork tokens, GitLab tokens) are **admin-entered and
  stored encrypted in the DB** via `@/common/crypto/encryption.service`, keyed by
  `INTEGRATION_ENCRYPTION_KEY`. Never move one into an env var "for simplicity", and never return a
  decrypted token in a response DTO — expose a boolean `isConfigured` instead.
- Every log line that can carry an integration payload or an HTTP error must go through
  `redact()` from `@/common/logging/redact.ts`. It strips `xoxb-`/`xoxp-`/`xapp-` tokens,
  `Bearer …`, and `token`/`authorization`/`access_token` JSON fields.
- JWT payload holds identity, not secrets and not role-derived permissions that change — roles are
  re-read where scope matters.
- Never log a full request body on an auth or integration route.

## Input handling

- Validation is DTO-only. If a value reaches a query without passing through a
  `class-validator`-decorated DTO field, it is unvalidated — that includes anything you pull off
  `@Req()`, headers, or a webhook body.
- **Webhooks** (`modules/webhooks`, GitLab) are unauthenticated by JWT. They must verify their own
  shared secret/signature and must treat every field as hostile. A webhook that triggers a DB write
  based on an unverified `project_id` is a real vulnerability.
- **SSRF**: any feature that fetches a URL supplied by an admin (avatar import, integration base
  URL) can be pointed at internal services. Validate the scheme and host allowlist.
- **File uploads** go through `StorageService` (S3/RustFS). Validate content type and size at the
  DTO, generate the storage key server-side, and never build a key from a client-supplied filename
  without sanitising it — path traversal into another prefix is the risk.
- Public file URLs from `buildPublicUrl` are unguessable but **not access-controlled**. Anything
  genuinely private needs a scoped, expiring URL — don't assume the current pattern is enough for a
  new sensitive document type.

## Server-to-server endpoints

`ApiKeyGuard` and `ExternalReadApiTokenGuard` protect the IM-compatibility endpoints. They are
bearer-token, read-only, and have **external callers**. Do not widen what they return, do not add a
mutation behind them, and do not reuse them for a new internal feature.

## When you touch auth

Auth is Google OAuth-first; there is no password reset flow. Adding one is a product decision, not
a refactor. Refresh-token rotation lives in `modules/auth` — read it fully before changing token
lifetimes, and remember the web client's `api-client.ts` has a single-flight 401→refresh retry that
assumes the current contract.
