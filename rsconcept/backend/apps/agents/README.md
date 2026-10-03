# Agent API authentication

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
There is no process-local failed-authentication budget that could lock out
valid users behind the same NAT.

## Deployment compatibility

This change retains the SHA-256 storage format and the 64-character field.
It adds no migration and does not revoke existing keys. Deployments on `main`
can use the same keys before and after this change, including during rollback.

If the earlier password-hasher version of PR #99 was deployed, its migration
may already have revoked SHA-256 keys. Removing the migration does not undo
those revocations. PBKDF2-only keys cannot be converted without their plaintext;
those installations must reissue affected keys and update integrations.
