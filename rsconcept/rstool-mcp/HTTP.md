# Streamable HTTP service

`rstool-mcp-http` hosts the existing rstool tool catalog over Streamable HTTP. Use it when MCP clients on several machines need a centrally managed runtime. `rstool-mcp` remains the local stdio entry point.

This is a single-process pilot service with bearer credentials. It does not implement an OAuth authorization server, project sharing/ACLs, a Portal REST adapter, or infrastructure administration.

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
| `RSTOOL_HTTP_ALLOWED_HOSTS` | Comma-separated permitted Host hostnames, without ports | `127.0.0.1,localhost,[::1]` |

Once configured, start `rstool-mcp-http`, or use `pnpm --filter @rsconcept/rstool-mcp run start:http` from a source checkout. Install a pinned package version. The CLI stops accepting requests and drains active requests on SIGINT/SIGTERM.

The service account needs exclusive read/write access to the persistence root and read access to its credential file. Use restrictive filesystem permissions and back up the persistence root. Schema contents, current-session pointers and diagnostics use rstool's existing file persistence. MCP transport IDs are ephemeral. Normal service restarts preserve the schema workspaces, but the existing file persistence is not a transactional database or a guarantee of recovery from an interrupted disk write.

## Connect clients

Configure a Streamable HTTP MCP client with:

- URL: `https://mcp.example.com/mcp/my-task`
- Header: `Authorization: Bearer <your-token>`

The hostname is illustrative. For local development, use `http://127.0.0.1:8093/mcp/my-task`. Production requires HTTPS at the reverse proxy. No credentials belong in the URL.

`my-task` selects a durable workspace belonging to the authenticated subject. Names are 1 to 64 ASCII letters, digits, dots, underscores or hyphens, beginning with a letter or digit. `/mcp` selects `default`. Use a different task name for each independently active agent. The server hashes the subject/workspace pair to choose a directory; neither value becomes a filesystem path.

After initialization, the client sends the returned `Mcp-Session-Id` on each subsequent POST/DELETE. Authentication is checked again on every request. A session ID from another subject or workspace returns 404. Referencing another workspace's rstool session, including as a synthesis source, cannot load its files.

One workspace permits one live MCP connection. A second initialization returns 409, including two agents using the same person's credential. This prevents independently cached copies or current-session pointers from overwriting each other. Requests within that connection and tool invocations inside a JSON-RPC batch are serialized. A failed asynchronous operation completes its rollback before the next tool starts. This is exclusive ownership, not collaborative editing or optimistic merging.

Send MCP DELETE to release a transport lease when finished. Closing the local client connection alone leaves the lease until idle expiry. After DELETE, expiry or a service restart, initialize a new MCP connection at the same URL and use `get_current_session` to resume the persisted schema. Do not reuse an expired transport ID. Deleting a transport does not delete schema data.

## Limits and errors

The programmatic `createRSToolHttpServer` factory accepts:

| Option | Default | Effect |
| --- | --- | --- |
| `maxSessions` | 32 | Maximum active workspace/transport leases, including initialization |
| `idleTimeoutMs` | 30 minutes | Release leases with no queued/in-flight requests after inactivity |
| `maxRequestBodySize` | 4 MiB | SDK limit before JSON parsing |
| `maxPendingRequests` | 8 per workspace | Bound queued and in-flight HTTP requests |
| `allowedHosts` | Loopback hostnames | DNS rebinding protection |
| `allowedOrigins` | Empty | Reject requests carrying an untrusted Origin header |

401 means credentials are missing or invalid; 404 means the route/session is unavailable to this identity; 409 means the workspace is already connected; 413 means the body is too large; 429 means the workspace queue is full; 503 means the active-session limit is reached or the service is stopping. Invalid initialization does not retain a lease. Tool-level rstool errors retain their existing MCP `isError` result.

Responses use JSON. The service returns 405 for GET because it does not provide server-initiated SSE streams. It does not enable browser CORS or trust forwarded identity headers.

These limits do not bound expression evaluation CPU time, total schema size, or historical workspace storage. A synchronous evaluation can block the Node.js event loop. Keep the pilot restricted to trusted internal users; hard compute budgets and worker isolation require a separate change.

## Reverse proxy and process ownership

Keep the HTTP listener on loopback behind an internal HTTPS reverse proxy. Forward the original allowed Host, Authorization, Content-Type, Accept, Mcp-Session-Id and Mcp-Protocol-Version headers. Add the proxy hostname to `RSTOOL_HTTP_ALLOWED_HOSTS`; forwarded Host/User headers are not used for authentication. Restrict the route to the intended LAN/VPN access. This package does not change firewall, DNS, TLS or systemd configuration.

Run exactly one service process for a persistence root. Do not use cluster/PM2 multi-worker mode, load-balance replicas over the same root, or run stdio against its workspace directories. The lease registry and serialization queue are process-local. A later shared-storage design needs cross-process locking or transactional revision checks.

For an existing identity provider, embed `createRSToolHttpServer` and supply `verifyToken`. It must validate the credential, issuer, audience, expiry and applicable access policy, returning a stable subject only on success. Do not accept a caller-supplied subject header or forward the incoming credential to Portal. OAuth discovery and authorization flows are outside this pilot.
