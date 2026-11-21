# Agent API authentication

## Description-only editing

`POST /api/agents/rsforms/:id/description` accepts only `expected_time_update`
and `description`, preserving whitespace and allowing empty text up to 100000
characters. It uses existing edit permissions, ordinary write quotas and audit.
A conditional update changes only description and a strictly advancing revision;
permission recheck or stale base rolls back. It does not create a version or
replace constituents. The MCP host independently reads back the result.

## Approved MCP publication

`GET /api/agents/me` resolves a bearer key to its account id/username without
returning key material. `POST /api/agents/rsforms/:id/publish` accepts
`{expected_time_update, schema}` and requires the `write` scope and owner/staff edit rights. Its
transaction conditionally claims the observed timestamp, preserves a full
version and replaces content. A stale timestamp returns 409; failed validation
or replacement leaves no partial schema or version. RSForm mutation helpers
take a library-row write lock before editing constituents. Existing routes keep
their contracts. Public data reads need no key. Private reads and writes require a suitable key and object access. Any active key can resolve its own identity.
Hosted MCP enrollment/approval and secret storage are documented in
[rstool-mcp/PORTAL.md](../../../rstool-mcp/PORTAL.md).

API keys contain a public prefix and a secret generated with
`secrets.token_urlsafe(32)`, giving the secret 256 random bits. Store the full
token as a SHA-256 hex digest. Authentication loads active candidates by their
public prefix and verifies the full digest with `hmac.compare_digest`.
Prefixes can contain underscores and can collide; neither grants access.

Password stretching protects human-chosen passwords with a small input space.
It adds avoidable CPU work to every Bearer request here, including invalid
secrets and valid requests that exceed a quota. SHA-256 preserves the existing
stored keys and is appropriate for these randomly generated secrets. This
helper must not be reused for human-chosen passwords.

CodeQL alert #18, `py/weak-sensitive-data-hashing`, treats the API token as data
requiring password stretching. The annotation on the SHA-256 operation scopes
the false-positive rationale to this operation and query. Other hashing and
password findings remain in scope. See the
[CodeQL query guidance](https://codeql.github.com/codeql-query-help/python/py-weak-sensitive-data-hashing/).

Read and write quotas use database counters shared by all workers. The local
cache only remembers recent refusals; losing it does not reset the quota.
Heavy operations, including publication, creation, and version snapshots, also
use a shared hourly limit of 15 requests per user regardless of key scopes.
There is no process-local failed-authentication budget that could lock out
valid users behind the same NAT.

## Deployment compatibility

This change retains the SHA-256 storage format and the 64-character field.
The scope/expiry migrations preserve existing tokens, hashes, and expiry dates.
Deploy the `write` policy and migration `0005` before the updated frontend and
MCP adapter. The migration removes the old `publish` permission and preserves
each key's existing `read` and `write` permissions. A key with only the former
`publish` permission is left with an empty scope list. Rolling back to code that
requires `publish` again requires reissuing publishing keys with that scope.

Before rolling back to a backend without key policies, revoke every scoped or expiring key, including already expired keys. The earlier backend ignores scopes and expiry and would otherwise give those keys the owner's full permissions again. Identify and revoke them while the policy fields still exist; do not reverse the migration first. Reissue replacement credentials only after deciding the rollback access policy. Database compatibility alone does not preserve key restrictions.

If the earlier password-hasher version of PR #99 was deployed, its migration
may already have revoked SHA-256 keys. Removing the migration does not undo
those revocations. PBKDF2-only keys cannot be converted without their plaintext;
those installations must reissue affected keys and update integrations.

## Key policy

The profile can create read-only or read/write keys and select a finite lifetime.
`write` grants access to mutations, including publication, subject to each
operation's object permissions. Scopes and `expires_at` are returned as nonsecret
metadata. The raw key is shown once. New keys require known, nonempty scopes and
a future expiration if an expiration is supplied. Expired keys do not consume
the active-key quota. Expired or revoked presented keys return 401. Requests
without a key can read public library data and have a per-address read limit.
The identity and key-management endpoints require authentication.
