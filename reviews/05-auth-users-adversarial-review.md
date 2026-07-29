# Adversarial Review: Auth & Users

## Scope

- Frontend: `rsconcept/frontend/src/features/auth/**`, `rsconcept/frontend/src/features/users/**`
- Backend: `rsconcept/backend/apps/users/**`, shared permissions/throttling, `project/settings.py` session/CSRF/CORS
- Transport/CSRF/auth sync: `rsconcept/frontend/src/backend/api-transport.ts`, `csrf-token.ts`, `auth-sync.ts` / `use-auth-sync.ts`
- Adjacent permission model used by staff/admin UI: `rsconcept/backend/shared/permissions.py`, frontend `adminMode` / `UserRole`

Threat focus: session fixation, CSRF, privilege escalation (staff/admin), password-reset abuse, profile/account enumeration, weak auth sync, logout failures leaving server sessions, IDOR on profiles, role confusion.

## Executive summary

No Critical auth bypass, profile IDOR, or API path to self-grant `is_staff` was found. Session auth + Django CSRF (with dual cookie/memory CSRF recovery) is generally sound; profile reads/writes are bound to `request.user`; staff gates on sensitive library endpoints are server-side.

The main weaknesses are **account/email enumeration** (password reset and signup), a **very long session lifetime** (and parent-domain cookies) that magnifies session theft, **CSRF-exempt password-reset POSTs** that enable cross-site reset-email triggering, and **missing email verification** on signup/profile email change. Frontend `UserRole` / `adminMode` are UI convenience only and do not by themselves escalate privilege if backend checks hold.

**Finding counts:** Critical 0 · High 2 · Medium 6 · Low 5 · Info 4

## Findings

### 1. High — Extremely long-lived session cookies

| | |
|---|---|
| **Severity** | High |
| **Location** | `rsconcept/backend/project/settings.py` (`SESSION_COOKIE_AGE = 2 years`, `CSRF_COOKIE_AGE = 1 year`); prod `.env.prod` sets `CSRF_COOKIE_DOMAIN` / `SESSION_COOKIE_DOMAIN=.portal.acconcept.ru` |
| **Description** | Authenticated sessions survive up to ~2 years without re-authentication. Production places session and CSRF cookies on the parent domain, so any XSS or cookie-capable compromise on a `*.portal.acconcept.ru` host can present a session cookie to the API host. |
| **Attack / failure scenario** | Attacker steals `sessionid` (XSS, malware, shared device, proxy log). They keep access until natural expiry or password change (auth hash invalidation), with no idle timeout or absolute shorter bound. |
| **Recommendation** | Shorten `SESSION_COOKIE_AGE` (e.g. days/weeks), add idle timeout or sliding expiry, consider `SESSION_EXPIRE_AT_BROWSER_CLOSE` for sensitive roles, and narrow cookie domain if frontend/API can share a single host. Prefer re-auth for staff/admin actions. |

### 2. High — Password-reset email enumeration (and UX that surfaces it)

| | |
|---|---|
| **Severity** | High |
| **Location** | `django_rest_passwordreset` default (`DJANGO_REST_PASSWORDRESET_NO_INFORMATION_LEAKAGE` unset); `PasswordResetRequestAPIView`; tests in `apps/users/tests/t_views.py` (`invalid@mail.ru` → 400, known email → 200); frontend `restore-password-page.tsx` maps 400 to an email-validation error |
| **Description** | Reset request returns a validation error when no eligible account exists, and success when it does. The SPA treats 400 as “bad email”, teaching clients the membership oracle. |
| **Attack / failure scenario** | Attacker walks a list of emails through `POST /users/api/password-reset` (5/hour/IP throttle slows but does not stop distributed probing) and builds a confirmed-user list for phishing or credential stuffing. |
| **Recommendation** | Set `DJANGO_REST_PASSWORDRESET_NO_INFORMATION_LEAKAGE = True` and always return a generic success. Align frontend copy so unknown vs known emails look identical. Consider stronger bot resistance (CAPTCHA) beyond IP throttle. |

### 3. Medium — Public active-user directory

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `ActiveUsersView` (`apps/users/views.py`) — `AllowAny`; `GET /users/api/active-users`; frontend `usersApi.getUsersQueryOptions` |
| **Description** | Any anonymous client can list all active users’ `id`, `first_name`, `last_name`. |
| **Attack / failure scenario** | Scrape the full user directory for social engineering, correlate IDs with library ownership/editor metadata elsewhere, or map organizational membership. |
| **Recommendation** | Require authentication; paginate; return only fields needed for pickers; or scope to users the caller already interacts with. |

### 4. Medium — Signup email/username enumeration

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `SignupSerializer.validate` (`emailAlreadyTaken`); Django unique `username` errors on create; `POST /users/api/signup` |
| **Description** | Registration distinguishes “email already taken” (and username conflicts) from other validation failures. |
| **Attack / failure scenario** | Attacker probes emails/usernames via signup (3/hour/IP) to confirm accounts, complementing reset enumeration. |
| **Recommendation** | Generic “unable to register” responses; send verification email instead of confirming existence; optionally delay responses to reduce timing oracles. |

### 5. Medium — CSRF-exempt password-reset endpoints enable cross-site email abuse

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `ResetPasswordRequestToken` / validate / confirm use `authentication_classes = ()` (DRF `APIView` is CSRF-exempt unless SessionAuthentication re-enables CSRF); wrappers in `apps/users/views.py` |
| **Description** | Password-reset POSTs do not require CSRF tokens. Confirm is gated by the secret token (acceptable), but **request** can be forged cross-site. |
| **Attack / failure scenario** | Malicious page issues `POST /users/api/password-reset` with a victim email (cookies optional). Victim receives reset mail; attacker pairs this with phishing (“click our lookalike link”). Throttle limits volume per IP only. |
| **Recommendation** | Keep confirm token-gated; for **request**, require CSRF (or same-site fetch + Origin checks), CAPTCHA, and/or signed same-origin form flow. Rotate tokens on every request instead of reusing an existing row. |

### 6. Medium — No email verification on signup or profile email change

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `SignupSerializer.create`; `UserSerializer` email update on `PATCH /users/api/profile` |
| **Description** | Accounts activate immediately with an unverified email. Profile can bind any free email without proving control. |
| **Attack / failure scenario** | Attacker registers or later claims `victim@org` before the real owner; receives future password-reset mail for that account; squats identities used for collaboration trust. Stolen session can permanently redirect recovery to attacker-controlled mail. |
| **Recommendation** | Verify email on signup and on email change (pending address + confirm link); keep old email for recovery until confirmed. |

### 7. Medium — Login throttle counts successful logins (shared-IP lockout)

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `LoginRateThrottle` + `DEFAULT_THROTTLE_RATES['login'] = 5/minute`; `test_login_throttling` accepts five successful logins then 429 |
| **Description** | Throttle is identity-by-IP and does not distinguish failure vs success. |
| **Attack / failure scenario** | Attacker from a shared NAT (office/VPN/CGNAT) burns the budget with successful or failed attempts, locking out legitimate users on that IP for a minute repeatedly. |
| **Recommendation** | Throttle failed authentications primarily; use username+IP buckets; backoff instead of hard lock on successes. |

### 8. Medium — Password-reset token retained in `sessionStorage`

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `password-change-page.tsx` (`rsconcept:password-reset-token-query`); strip of `?token=` from URL |
| **Description** | Stripping the query token is good against Referer leakage, but the token is copied to `sessionStorage` until successful reset (or abandon). Comment says “dev only” but the storage path runs in all builds. |
| **Attack / failure scenario** | XSS (or malicious extension) on the portal origin during an open reset tab reads the token and calls confirm. Abandoned tabs leave the secret around longer than the URL did. |
| **Recommendation** | Prefer in-memory React state only after one-time read; clear storage on unmount/failure; avoid persisting secrets. Keep URL strip. |

### 9. Low — Frontend role / `adminMode` can diverge from real privileges

| | |
|---|---|
| **Severity** | Low |
| **Location** | `features/users/stores/role.ts`, `menu-role.tsx`, `preferences.adminMode`; library hooks combine `user.is_staff && adminMode` for `/api/library/all` |
| **Description** | `UserRole` is client-selected UX. Console/`localStorage` can set `ADMIN` or `adminMode` without being staff. Backend `GlobalAdmin` / `can_edit_item` still enforce `is_staff`. |
| **Attack / failure scenario** | Confused-deputy UI may show admin controls to a tampered client; mutations fail server-side. Risk is UX confusion and false sense of privilege, not direct escalation (assuming all mutating APIs check server-side). |
| **Recommendation** | Derive display role only from server flags; never persist elevated role without `is_staff`; audit any client-only gates. |

### 10. Low — Cross-tab auth sync can desync UI without destroying the session

| | |
|---|---|
| **Severity** | Low |
| **Location** | `auth-sync.ts`, `use-auth-sync.ts`, `use-logout.ts` |
| **Description** | A `logout` BroadcastChannel event sets anonymous query data and resets caches but does not clear the HTTP session by itself. Only a successful `POST /users/api/logout` invalidates the server session. |
| **Attack / failure scenario** | Same-origin script posts a fake `logout` event: other tabs look logged out while `sessionid` remains valid until next auth refetch/focus. Opposite (`login`) only refetches—cannot forge a session. |
| **Recommendation** | On sync `logout`, force `GET /users/api/auth` (or logout API) before trusting anonymous UI; ignore unauthenticated broadcast without cookie proof. |

### 11. Low — CSRF memory token not cleared on logout

| | |
|---|---|
| **Severity** | Low |
| **Location** | `csrf-token.ts` (`memoryToken`); `use-logout.ts` does not clear CSRF; clear only on CSRF 403 refresh |
| **Description** | After logout, in-memory CSRF may be stale until 403 retry refreshes via `/users/api/auth`. |
| **Attack / failure scenario** | Rare race: first mutating request after logout/login fails CSRF once; interceptor retries. Mostly availability/UX, not auth bypass. |
| **Recommendation** | Clear `memoryToken` in logout `onSuccess` / auth-sync logout path; refresh CSRF after login. |

### 12. Low — HSTS max-age is only one hour

| | |
|---|---|
| **Severity** | Low |
| **Location** | `SECURE_HSTS_SECONDS = 3600` when not `DEBUG` |
| **Description** | Short HSTS window weakens HTTPS enforcement vs typical multi-month policies. |
| **Attack / failure scenario** | After expiry, users may be reachable over HTTP again (if not otherwise forced), enabling cookie stripping / downgrade on insecure networks. |
| **Recommendation** | Raise to ≥15552000 (180 days) once HTTPS is stable; keep preload only if all subdomains are HTTPS-ready. |

### 13. Low — Open registration without proof-of-human beyond soft rate limits

| | |
|---|---|
| **Severity** | Low |
| **Location** | `SignupAPIView` + `SignupRateThrottle` (`3/hour` per IP) |
| **Description** | Anyone can create usable accounts with no email proof and modest IP throttling. |
| **Attack / failure scenario** | Distributed signup spam, library clutter, abuse of authenticated features that only check “is logged in”. |
| **Recommendation** | CAPTCHA / invite codes / email verification; tighter distributed-abuse controls. |

### 14. Info — API schema served with `AllowAny`

| | |
|---|---|
| **Severity** | Info |
| **Location** | `SPECTACULAR_SETTINGS['SERVE_PERMISSIONS']` |
| **Description** | OpenAPI/Swagger surface is publicly readable (submit methods disabled). Aids legitimate integrators and attackers equally for endpoint discovery. |
| **Attack / failure scenario** | Recon only unless combined with other bugs. |
| **Recommendation** | Restrict docs to staff or private networks in production if recon surface matters. |

### 15. Info — `DEBUG` flips default DRF permission to `AllowAny`

| | |
|---|---|
| **Severity** | Info |
| **Location** | `REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES']` in `settings.py` |
| **Description** | Mis-shipping `DEBUG=True` widens default permissions for views that omit explicit classes. User auth views mostly set permissions explicitly; residual risk is elsewhere. |
| **Attack / failure scenario** | Config error → unintended anonymous access on default-permission endpoints. |
| **Recommendation** | Keep production `DEBUG=False` checks in deploy; prefer fail-closed default even in DEBUG for closer parity. |

### 16. Info — Auth payload exposes editor item IDs

| | |
|---|---|
| **Severity** | Info |
| **Location** | `AuthSerializer` / `GET /users/api/auth` |
| **Description** | Authenticated auth response includes `editor: [library item pk, …]` and `is_staff`. |
| **Attack / failure scenario** | Useful to the owner of the session; if auth JSON leaks (XSS, shared logs, over-verbose Sentry with PII), maps editable assets. |
| **Recommendation** | Acceptable for app function; avoid logging full auth payloads; review `SENTRY_SEND_DEFAULT_PII` default `True`. |

### 17. Info — Hardcoded production recovery URL in mail signal

| | |
|---|---|
| **Severity** | Info |
| **Location** | `apps/users/signals.py` (`_RECOVERY_URL = 'https://portal.acconcept.ru/password-change'`) |
| **Description** | Reset links always point at production frontend, independent of deploy env. |
| **Attack / failure scenario** | Staging/dev resets confuse operators; not a direct prod exploit. |
| **Recommendation** | Drive base URL from settings/env per environment. |

## Positive observations

- **Session fixation:** `django.contrib.auth.login` cycles the session key; login uses session auth rather than putting credentials in durable client storage.
- **CSRF posture for session mutations:** `CsrfViewMiddleware` + DRF `SessionAuthentication`; frontend attaches `x-csrftoken` from memory (from `GET /users/api/auth`) or cookie, with single 403 retry (`api-transport.ts` / `csrf-token.ts`).
- **Profile IDOR avoided:** `UserProfileAPIView.get_object()` returns `request.user` only—no user-id path parameter.
- **Mass-assignment resistance:** `StrictModelSerializer` rejects unknown fields; signup/profile serializers omit `is_staff` / `is_superuser`; username is read-only on profile update.
- **Password change / reset invalidate sessions:** `set_password` updates the session auth hash so other sessions fail subsequent requests.
- **Reset confirm race:** Custom `PasswordResetConfirmAPIView` uses `select_for_update` and deletes tokens after use; tests assert second confirm fails.
- **Throttles exist** on login, signup, and password-reset flows (`shared/throttling.py`).
- **Logout client hygiene:** `useLogout` only clears cached user / broadcasts logout on success; failed logout does not pretend to succeed.
- **Staff admin library list** is `GlobalAdmin` (`LibraryAdminView`); frontend `adminMode` alone cannot fetch `/api/library/all`.
- **Opening Django admin** (`user-dropdown` `gotoAdmin`) logs out of the SPA session first, forcing a fresh admin login.
- **Login error wording** for bad password / unknown email-as-username is unified (`passwordAuthFailed`).
- **Password validators** enabled server-side (length, common, numeric, similarity); frontend mirrors minimum checks.

## Residual risks / untested areas

- Live production cookie flags (`SameSite`, host-only vs domain) were inferred from settings/env, not captured from a prod HTTP response.
- Full XSS review of the SPA (would turn session/token findings into practical account takeover) was out of scope.
- Django admin hardening (2FA, allowed IPs, `AdminSite` audit) not reviewed beyond logout-before-admin UX.
- Timing side channels on login/signup/reset were not measured.
- Agents API-key auth (`apps/agents`) overlaps session users but was outside the stated auth/users feature scope.
- Email deliverability / SPF/DKIM and reset-mail phishing resistance not tested.
- Behavior under `DEBUG=True` in a deployed-like environment not runtime-verified.
- Concurrent multi-tab login/logout races and service-worker caching of auth responses not exhaustively tested.
- Whether all mutating library/OSS/RSForm endpoints consistently use shared permission helpers (vs a stray `AllowAny` write) was only spot-checked for staff listing.
