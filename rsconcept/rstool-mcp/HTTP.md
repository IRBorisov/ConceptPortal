# Streamable HTTP service

`rstool-mcp-http` hosts the existing rstool tool catalog over Streamable HTTP. Use it when MCP clients on several machines need a centrally managed runtime. `rstool-mcp` remains the local stdio entry point.

This is a single-process pilot service with bearer credentials. Optional [Portal publication](PORTAL.md) adds encrypted per-subject keys and a separate approval page. It does not implement an OAuth authorization server, project sharing/ACLs, or infrastructure administration.

## Configure the service

The CLI requires a protected credentials file outside the repository. Its JSON shape is:

```json
[
  { "subject": "user-id", "token": "<random-256-bit-token>" }
]
```

Replace the placeholder with a cryptographically random token. Tokens must contain at least 32 non-whitespace characters. Never commit this file or print its contents. Give each person a stable subject and separate credentials; never use one shared administrator token. Multiple different tokens may map to the same subject for rotation. The file is loaded at startup, so restart the service after changing it or revoking a credential. The verifier stores token hashes in memory.

| Environment variable | Meaning | Default |
| --- | --- | --- |
| `RSTOOL_HTTP_TOKENS_FILE` | Absolute path to the credentials JSON | Required |
| `RSTOOL_PERSISTENCE_DIR` | Private durable root for rstool workspaces | Required |
| `RSTOOL_HTTP_HOST` | Bind address | `127.0.0.1` |
| `RSTOOL_HTTP_PORT` | Listening port | `8093` |
| `RSTOOL_MAX_SESSIONS_PER_ACCOUNT` | Maximum stored sessions across all workspaces for one subject | `20` |
| `RSTOOL_SESSION_RETENTION_SECONDS` | Stored-session inactivity lifetime, renewed on access | `2592000` (30 days) |
| `RSTOOL_HTTP_ALLOWED_HOSTS` | Comma-separated permitted Host hostnames, without ports | `127.0.0.1,localhost,[::1]` |

Once configured, start `rstool-mcp-http`, or use `pnpm --filter @rsconcept/rstool-mcp run start:http` from a source checkout. Install a pinned package version. The CLI stops accepting requests and drains active requests on SIGINT/SIGTERM.

The service account needs exclusive read/write access to the persistence root and read access to its credential file. Use restrictive filesystem permissions and back up the persistence root. Schema contents, current-session pointers and diagnostics use rstool's file persistence. Each JSON file is flushed to a private temporary sibling and atomically replaced; a failed write leaves its previous target intact. The schema file and current-session pointer are separate commits, not a transactional database or a power-loss durability guarantee. MCP transport IDs are ephemeral, while normal service restarts preserve schema workspaces.

## Connect clients

Configure a Streamable HTTP MCP client with:

- URL: `https://mcp.example.com/mcp/my-task`
- Header: `Authorization: Bearer <your-token>`

The hostname is illustrative. For local development, use `http://127.0.0.1:8093/mcp/my-task`. Production requires HTTPS at the reverse proxy. No credentials belong in the URL.

`my-task` selects a durable workspace belonging to the authenticated subject. Names are 1 to 64 ASCII letters, digits, dots, underscores or hyphens, beginning with a letter or digit. `/mcp` selects `default`. Use a different task name for each independently active agent. The server hashes the subject/workspace pair to choose a directory; neither value becomes a filesystem path.

After initialization, the client sends the returned `Mcp-Session-Id` on each subsequent POST/DELETE. Authentication is checked again on every request. A session ID from another subject or workspace returns 404. Referencing another workspace's rstool session, including as a synthesis source, cannot load its files.

One workspace permits one live MCP connection. A second initialization returns 409, including two agents using the same person's credential. This prevents independently cached copies or current-session pointers from overwriting each other. Requests within that connection and tool invocations inside a JSON-RPC batch are serialized. A failed asynchronous operation completes its rollback before the next tool starts. This is exclusive ownership, not collaborative editing or optimistic merging.

Send MCP DELETE to release a transport lease when finished. Closing the local client connection alone leaves the lease until idle expiry. After DELETE, transport expiry or a service restart, initialize a new MCP connection at the same URL and use `get_current_session` to resume a schema still within its storage retention period. Do not reuse an expired transport ID. Deleting a transport does not delete schema data.

## Limits and errors

The programmatic `createRSToolHttpServer` factory accepts:

| Option | Default | Effect |
| --- | --- | --- |
| `maxSessions` | 32 | Maximum active workspace/transport leases, including initialization |
| `maxStoredSessionsPerAccount` | 20 | Total stored sessions across all workspaces belonging to one subject |
| `sessionRetentionMs` | 30 days | Remove stored sessions after inactivity, including cached sessions |
| `sessionCleanupIntervalMs` | 1 minute | Background scan; access and creation also enforce expiry |
| `idleTimeoutMs` | 30 minutes | Release leases with no queued/in-flight requests after inactivity |
| `maxRequestBodySize` | 4 MiB | SDK limit before JSON parsing |
| `maxPendingRequests` | 8 per workspace | Bound queued and in-flight HTTP requests |
| `authenticationTimeoutMs` | 5 seconds | End a stalled credential check with 503 and abort its optional cancellation signal |
| `allowedHosts` | Loopback hostnames | DNS rebinding protection |
| `allowedOrigins` | Empty | Reject requests carrying an untrusted Origin header |

401 means credentials are missing or invalid; 404 means the route/session is unavailable to this identity; 409 means the workspace is already connected; 413 means the body is too large; 429 means the workspace queue is full; 503 means authentication timed out, the active-session limit is reached or the service is stopping. Invalid initialization or an initialize response interrupted before write completion does not retain a lease. An interrupted response on an existing transport preserves its lease. Tool-level rstool errors retain their existing MCP `isError` result.

MCP responses use JSON and MCP GET returns 405 because server-initiated SSE is not provided. Optional Portal account routes serve HTML/JS/CSS and authenticated settings APIs; see [Portal publication](PORTAL.md). The service does not enable browser CORS or trust forwarded identity headers.

These limits bound stored session counts and inactivity, not expression evaluation CPU time, bytes per schema, or the number of empty workspace directories. A synchronous evaluation can block the Node.js event loop. Keep the pilot restricted to trusted internal users; hard compute budgets and worker isolation require a separate change.

## Reverse proxy and process ownership

Keep the HTTP listener on loopback behind an internal HTTPS reverse proxy. Forward the original allowed Host, Authorization, Content-Type, Accept, Mcp-Session-Id and Mcp-Protocol-Version headers. Add the proxy hostname to `RSTOOL_HTTP_ALLOWED_HOSTS`; forwarded Host/User headers are not used for authentication. Restrict the route to the intended LAN/VPN access. This package does not change firewall, DNS, TLS or systemd configuration.

Run exactly one service process for a persistence root. Do not use cluster/PM2 multi-worker mode, load-balance replicas over the same root, or run stdio against its workspace directories. The lease registry and serialization queue are process-local. A later shared-storage design needs cross-process locking or transactional revision checks.

For an existing identity provider, embed `createRSToolHttpServer` and supply `verifyToken`. It must validate the credential, issuer, audience, expiry and applicable access policy, returning a stable subject only on success. The optional second argument is an AbortSignal that is aborted when verification times out; use it to cancel network calls. The deadline ends the HTTP request even if the verifier ignores cancellation. Do not accept a caller-supplied subject header or forward the incoming credential to Portal. OAuth discovery and authorization flows are outside this pilot.

## Stored-session quota and retention

Stored rstool sessions are distinct from MCP transport leases. Quota is per authenticated subject across all workspaces, persists across restarts, and also covers imports and implicit creation. Replacing an existing session ID does not consume an additional slot. A lower configured limit preserves existing sessions and rejects further creations until usage drops below it; the host never evicts a non-expired session just to admit another one.

Successful reads, edits, evaluations and exports renew the storage inactivity clock. Pings, connection status checks and a live transport do not. Client-supplied creation/update timestamps are not used as retention clocks. During an in-flight tool invocation, its workspace is pinned against background expiry. An expired session cannot be revived from a cached library instance. A sweep removes the session JSON and its access metadata; an old current-session pointer can therefore refer to a missing session. Create a new session explicitly after the error instead of silently continuing with an empty schema. Pending Portal approvals for an affected live workspace are invalidated. Session state, diagnostics and revisions are removed together; encrypted Portal credentials are unaffected.

Both CLI settings require positive safe integers. Seconds must also convert to safe integer milliseconds. Invalid values fail startup. The embedded factory uses millisecond options. This policy requires exclusive single-process ownership of the root, just like session persistence itself. A sweep runs every minute and before creation; persisted access checks reject expiry without waiting for the timer. Long-running synchronous work can delay timers.

Failures are MCP tool results with `isError: true`; both JSON text content and `structuredContent.error` contain a stable `code` and a safe `message`:

| Code | Meaning / recovery |
| --- | --- |
| `SESSION_LIMIT_REACHED` | Includes `limit`, `count`, and `retryAfterSeconds` until the earliest current expiry, if no sessions are used again. Reuse an existing session or wait for expiry. Other accounts remain available. |
| `SESSION_EXPIRED` | The referenced session just expired and was removed. Includes `retentionSeconds`. Create a new session or import a separately saved export. |
| `SESSION_NOT_FOUND_OR_EXPIRED` | Unknown, foreign-workspace, or previously removed session ID. No cross-account existence information is disclosed. |
| `SESSION_STORAGE_MIGRATION_REQUIRED` | Legacy workspace owners have not all been indexed. An administrator must finish the ownership migration before any new session can be admitted without undercounting. Existing sessions remain accessible. |
| `SESSION_STORAGE_UNAVAILABLE` | Storage metadata is unavailable or invalid. No quota bypass is allowed; contact the operator. |

The retry hint is not a reservation: subsequent use of existing sessions may move expiry later. These are stored-session tool errors, not HTTP 429 transport backpressure. HTTP metadata failures during connection setup return 503. Ordinary unconfigured library/stdio use has no storage quota or TTL; the HTTP host installs trusted storage lifecycle hooks.

### Existing persistence roots

Back up the root and stop every process using it before offline administrative indexing. Legacy workspace hashes cannot be reversed into subject/workspace names, so the service does not guess their owners. Each successful authenticated workspace connection claims its own namespace; remaining unowned legacy directories containing sessions cause new creations to fail closed with `SESSION_STORAGE_MIGRATION_REQUIRED`.

An operator can index a known workspace without changing its contents:

```sh
rstool-mcp-session-index --persistence-dir /srv/mcp-state --subject employee-1 --workspace project-a
```

For a legacy hash whose owner has been independently established, use `--namespace <64-character-sha256>` instead of `--workspace`. Do not assign an unknown namespace to an arbitrary user. Run as the service account so ownership remains correct. Existing owner metadata cannot be reassigned by this command. First indexing gives legacy sessions a full retention period starting now; repeating indexing or reconnecting does not reset established clocks. Neither indexing nor a quota reduction deletes existing sessions. Restart the service only after ownership mapping and configuration have been reviewed. Once retention is enabled, expired sessions are deleted, so backups and exported sessions are the recovery path.

The private `.lifecycle` directory in each workspace holds only an account hash and server-controlled per-session access clocks. Keep it together with the session files during backup/restore. Do not edit metadata while the service runs; missing metadata is initialized for legacy data, while corrupt or conflicting metadata fails closed. The index command prints neither session payloads nor credentials.

Retention metadata writes are coalesced within each hosted invocation, with the latest access clock durably flushed before the result is returned. A failed replacement lifecycle write restores the prior session envelope; ordinary session-file and current-pointer failures are returned as sanitized hosted storage errors. Cleanup isolates per-workspace failures and continues with healthy workspaces. New creation still fails closed for accounts whose stored count cannot be safely established; if owner metadata itself is unreadable, ownership cannot be assumed.

Publication preparation and approval validate source retention using current time, independently of a longer-running invocation pin. An expired source invalidates pending proposals before publication can start. A source that is still valid can be read and renewed as part of approval. Retention does not attempt to roll back a publication that was already sent while valid.

The offline index command rejects missing targets and options used as missing values. An existing empty workspace is reported as empty without claiming that session clocks were created. Unexpected or invalid JSON is not enrolled for deletion and causes a safe storage error. Restore old backups offline and export needed sessions before starting a retention-enabled host if their saved access clocks are already expired.
