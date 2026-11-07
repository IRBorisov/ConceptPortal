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

## Recover a lost connection ID

When a client dies between requests and loses its MCP session ID, initialization still returns 409. It never silently replaces a healthy client. An authenticated caller can explicitly disconnect its own idle lease without the old ID:

1. `GET /mcp/my-task/connection` with the normal bearer credential. It returns `state=connected|draining|disconnected`, `busy`, `idleSeconds` and an opaque `ETag` header for a present lease. No transport ID or credential is returned. Reads do not renew activity or retention.
2. After deciding to disconnect that client, send `DELETE /mcp/my-task/connection` with `If-Match` copied exactly from the ETag. No request body is accepted. Success is 204. A changed revision, missing precondition, busy or draining lease returns 409; an absent lease returns 404.
3. Initialize a new MCP connection at the original workspace URL. Saved schemas remain available. This is transport recovery, never deletion of stored models or automatic retry of uncertain mutations.

Use `/mcp/default/connection` for `/mcp`. Both routes use the same Host, Origin and subject/workspace checks as MCP. The opaque revision changes on every admitted MCP request and tool start/completion, even within one clock tick. A resumed client invalidates an earlier recovery snapshot. This API is an explicit disconnect by another caller with the same authenticated identity, not proof that the old process is dead. Coordinate with another live client before releasing it. It does not provide a force-release or takeover option.

An incomplete request body, interrupted response or `requestTimeoutMs` deadline closes that lease to new work and closes its HTTP responses. Tools queued behind a running tool cannot start after draining begins. Every actual tool invocation, including Portal and storage/metadata tools, keeps ownership until it settles, independently of the HTTP handler. A lease with a non-cancellable asynchronous operation stays draining and consumes its session slot; it is never replaced by a second mutable agent. HTTP deadlines bound connections, not the duration of external side effects. Inspect Portal after an interrupted write.

`service.close()` waits for actual tool drain before resolving, so an embedding host must await it before reusing the persistence directory. If non-cancellable code never settles, close cannot complete safely. Synchronous CPU work can also block the event loop and its timers. These cases require stopping the old process before starting another; this release adds no worker isolation or cross-process lock.

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
| `requestTimeoutMs` | 120 seconds | Close stalled HTTP responses and drain their workspace lease; does not forcibly stop running tool code |
| `maxPendingRequests` | 8 per workspace | Bound queued and in-flight HTTP requests |
| `authenticationTimeoutMs` | 5 seconds | End a stalled credential check with 503 and abort its optional cancellation signal |
| `allowedHosts` | Loopback hostnames | DNS rebinding protection |
| `allowedOrigins` | Empty | Reject requests carrying an untrusted Origin header |

401 means credentials are missing or invalid; 404 means the route/session is unavailable to this identity; 409 means the workspace is already connected; 413 means the body is too large; 429 means the workspace queue is full; 503 means authentication timed out, the active-session limit is reached or the service is stopping. Invalid initialization or an initialize response interrupted before write completion does not retain a lease. An interrupted response on an existing transport drains its lease; inspect the remote outcome before retrying any write. Tool-level rstool errors retain their existing MCP `isError` result.

MCP responses use JSON and MCP GET returns 405 because server-initiated SSE is not provided. Optional Portal account routes serve HTML/JS/CSS and authenticated settings APIs; see [Portal publication](PORTAL.md). The service does not enable browser CORS or trust forwarded identity headers.

These limits bound stored session counts and inactivity, not expression evaluation CPU time, bytes per schema, or the number of empty workspace directories. A synchronous evaluation can block the Node.js event loop. Keep the pilot restricted to trusted internal users; hard compute budgets and worker isolation require a separate change.

## Reverse proxy and process ownership

Keep the HTTP listener on loopback behind an internal HTTPS reverse proxy. Forward the original allowed Host, Authorization, Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, ETag and If-Match headers. Add the proxy hostname to `RSTOOL_HTTP_ALLOWED_HOSTS`; forwarded Host/User headers are not used for authentication. Restrict the route to the intended LAN/VPN access. This package does not change firewall, DNS, TLS or systemd configuration.

Run exactly one service process for a persistence root. Do not use cluster/PM2 multi-worker mode, load-balance replicas over the same root, or run stdio against its workspace directories. The lease registry and serialization queue are process-local. A later shared-storage design needs cross-process locking or transactional revision checks.

For an existing identity provider, embed `createRSToolHttpServer` and supply `verifyToken`. It must validate the credential, issuer, audience, expiry and applicable access policy, returning a stable subject only on success. The optional second argument is an AbortSignal that is aborted when verification times out; use it to cancel network calls. The deadline ends the HTTP request even if the verifier ignores cancellation. Do not accept a caller-supplied subject header or forward the incoming credential to Portal. OAuth discovery and authorization flows are outside this pilot.

## Stored-session quota and retention

Stored rstool sessions are distinct from MCP transport leases. Quota is per authenticated subject across all workspaces, persists across restarts, and also covers imports and implicit creation. Replacing an existing session ID does not consume an additional slot. A lower configured limit preserves existing sessions and rejects further creations until usage drops below it; the host never evicts a non-expired session just to admit another one.

Successful reads, edits, evaluations and exports renew the storage inactivity clock. Pings, connection status checks and a live transport do not. Client-supplied creation/update timestamps are not used as retention clocks. During an in-flight tool invocation, its workspace is pinned against background expiry. An expired session cannot be revived from a cached library instance. A sweep removes the session JSON and its access metadata and clears its persisted/in-memory current selection. `get_current_session` then returns null and `ensure_session` can explicitly create a new session; calls referencing the removed ID still fail. Do not treat a newly created empty session as recovery of expired data. Pending Portal approvals for an affected live workspace are invalidated. Session state, diagnostics and revisions are removed together; encrypted Portal credentials are unaffected.

Both CLI settings require positive safe integers. Seconds must also convert to safe integer milliseconds. Invalid values fail startup. The embedded factory uses millisecond options. This policy requires exclusive single-process ownership of the root, just like session persistence itself. A sweep runs every minute and before creation; persisted access checks reject expiry without waiting for the timer. Long-running synchronous work can delay timers.

Failures are MCP tool results with `isError: true`; both JSON text content and `structuredContent.error` contain a stable `code` and a safe `message`:

| Code | Meaning / recovery |
| --- | --- |
| `SESSION_LIMIT_REACHED` | Includes `limit`, `count`, and `retryAfterSeconds` until the earliest current expiry, if no sessions are used again. Inspect get_session_storage_config and list_stored_sessions, then reuse a session, wait for expiry, or explicitly delete a selected session under the client approval policy. Other accounts remain available. |
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

## Agent self-service for account storage

Hosted initialization instructions include the effective per-account maximum and inactivity TTL. These account-management tools exist only on HTTP; they do not change the ordinary library/stdio tool catalog. `list_methods` returns the complete MCP catalog, including configured integrations.

| Tool | Purpose | Safety metadata |
| --- | --- | --- |
| `get_session_storage_config` | Effective limits, cleanup cadence, safe transport limits and this account's stored/available counts | Read-only; no credentials, filesystem paths, model contents or TTL renewal |
| `list_stored_sessions` | Oldest-used-first metadata across this account's workspaces, with bounded pages | Read-only; no TTL renewal |
| `delete_stored_session` | Explicit compare-and-delete of exactly one listed session, freeing one stored slot | Destructive; explicit call intent and client/user approval policy apply |

Configuration uses `limits.maxSessionsPerAccount`, `limits.retentionSeconds`, `limits.cleanupIntervalSeconds`, `usage.storedSessions`, and `usage.availableSlots`. If ownership migration is incomplete, `usage.status` is `migration_required` and available capacity is unknown (`null`), not a guessed free count. Unavailable metadata produces `usage.status=unavailable`. No current usage counts from other accounts are exposed.

List accepts `limit` (default 20, maximum 100) and a returned opaque `cursor`. Each entry has an opaque `sessionRef`, exact `sessionId`, opaque workspace ID and its name when known, bounded title/alias with truncation flags, item count when readable, server `lastUsedAt`/`expiresAt`, and separate `current`, `connected`, `busy`, and caller-workspace flags. It also returns a `revision` and deletion eligibility flags. Models, comments and expressions are not returned. Workspace names missing from legacy metadata remain unknown until a verified connection or offline name-based indexing establishes them.

Pagination is oldest-first with stable identity tie-breaks. `SESSION_LIST_CHANGED` means the set/order or recorded activity changed while paging: restart without a cursor. Connected/busy state may change between responses. Compare-and-delete independently checks the current payload/activity revision immediately before deletion. Page bounds limit response size and entries, not CPU or memory used reading large saved payloads. The trusted-pilot limitation on per-model bytes and computation still applies.

At `SESSION_LIMIT_REACHED`, reuse an existing session or inspect config and list before selecting an unneeded session. The structured error includes trusted recovery tool names. Never silently evict the oldest session. Respect the user's/project's deletion policy and client approval rules. `confirm=true` expresses explicit call intent; it is not evidence of human consent.

```json
{
  "sessionRef": "<copy exactly from list_stored_sessions>",
  "expectedRevision": "<copy that entry's revision>",
  "confirm": true,
  "allowCurrent": false
}
```

Pass the object to `delete_stored_session`. References include both workspace and session identity because import may preserve the same session ID in multiple workspaces. The host rechecks the authenticated owner, busy state and revision without an await before deletion. The revision covers payload bytes, server activity generation/time, current selection and busy state. A reference listed while busy must be refreshed after that operation completes. Every model-access invocation changes activity generation, even at an unchanged clock timestamp, so a same-clock read or edit/import ABA invalidates an old selection. Listing/config do not change it.

| Error | Recovery |
| --- | --- |
| `SESSION_BUSY` | Another model invocation is using the target workspace; wait and refresh the list |
| `SESSION_CHANGED` | The selected session was changed or used; refresh and decide again |
| `SESSION_IS_CURRENT` | Deleting this workspace's selection requires explicit `allowCurrent=true`; only use it when intending to discard that selection |
| `SESSION_DELETE_CONFIRMATION_REQUIRED` | Supply explicit call intent after selecting the exact entry and following the applicable approval policy |
| `SESSION_NOT_FOUND_OR_EXPIRED` | The reference is absent, removed, expired or not owned by this account; inspect current config/list |

Deletion clears data, diagnostics, revisions, cached state and current selection, and invalidates pending publication drafts in the affected workspace. It does not disconnect the personal Portal key or roll back publication already dispatched while valid. Non-current sessions in another workspace can be selected, but a busy target cannot be removed. Management calls themselves are not treated as model-operation pins, so they can delete an explicitly selected current session without deadlocking on their own call.

Success returns `deleted=true`, `freedSlots=1` and updated account usage. The payload unlink is the commit point. If later metadata/cache/publication/workspace cleanup fails, success remains explicit and `cleanupWarnings` explains required follow-up; the service retries orphan timestamp cleanup. Do not choose a second deletion to compensate for such a warning. A timeout or lost response can also leave an unknown outcome: inspect config/list before attempting anything else. Repeating the same delete is not advertised as idempotent; it can return not-found or stale-revision.

Empty disconnected workspaces are pruned after invalid initialization, closing an empty lease, deleting their last session, or expiry of their last saved session. Pruning removes only known metadata and never recursively deletes directories or model payloads. Busy, connected and unrecognized-content directories are preserved. This prevents normal authenticated empty-workspace churn from accumulating permanent directories; it is not a general request-rate or per-model-byte budget.

New hosted session IDs are limited to 250 UTF-8 bytes before persistence, preventing oversized filenames from exposing native filesystem errors. Existing IDs remain addressable for listing/deletion. This does not impose a new global ID byte limit on unconfigured Windows/library persistence. Hosted storage errors also sanitize filesystem failures by code and path/syscall indicators, including aggregated errors.


MCP 2.0 uses rstool 3.0 / contract 4.0: only explicit create/ensure/import and schema-patch creation can consume new slots. Reads, analysis, exports and evaluation require an existing session and return `NO_CURRENT_SESSION` when none is selected. Call `ensure_session` or `create_session`; storage config/list tools remain available without creating a model. This change applies equally to library and stdio use. See the [migration notes](../rstool/README.md#contract-4-migration).

The offline index CLI accepts `--subject=--employee` for an identity beginning with two dashes. In ordinary separated arguments, an option cannot stand in for a missing value. Unknown and duplicate options remain invalid.
