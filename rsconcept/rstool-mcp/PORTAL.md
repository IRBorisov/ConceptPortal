# Portal publication and private credentials

Optional integration for the HTTP host. The unconfigured HTTP service and stdio catalog are unchanged. Publication replaces an existing owned schema; it does not create objects, move them, or change access policies. Deploy the backend endpoints in this release before enabling it.

## Host configuration

All five settings are required together:

| Variable | Meaning |
| --- | --- |
| `RSTOOL_PORTAL_ORIGIN` | Fixed HTTPS API origin, for example `https://api.portal.acconcept.ru`, without a path |
| `RSTOOL_PUBLIC_ORIGIN` | Exact HTTPS browser origin, for example `https://mcp.example.com`, no trailing slash |
| `RSTOOL_PORTAL_VAULT_DIR` | Private writable directory separate from rstool workspace storage |
| `RSTOOL_PORTAL_MASTER_KEY_FILE` | Path to exactly 32 random binary bytes, provisioned outside Git |
| `RSTOOL_ACCOUNT_TOKENS_FILE` | Protected JSON credentials for human settings/approval access, separate from agent MCP tokens |

Keep the master key outside the vault and ordinary application backups. Deliver it with systemd encrypted credentials or an equivalent secret manager. An illustrative systemd override is:

```ini
[Service]
LoadCredentialEncrypted=portal-master-key:/etc/credstore.encrypted/rstool-portal-master-key
Environment=RSTOOL_PORTAL_MASTER_KEY_FILE=/run/credentials/rstool-mcp.service/portal-master-key
StateDirectory=rstool-mcp rstool-portal
```

Provision the encrypted credential using `systemd-creds` and an independent 32-byte random key. Select host-secret/TPM binding for the actual machine. This is not an installer or a recovery procedure. Never use a password, API key, MCP token or public example value as the master key.

Personal credentials use AES-256-GCM, fresh random IVs, authenticated subject binding, atomic replacement and mode-0600 files in a mode-0700 directory. Provision correct ownership; permissions of an existing directory are not automatically repaired. Workspace JSON contains no Portal credentials. Environment variables contain paths, not secret values.

Encryption protects stored records, not a compromised process or root. The service can decrypt the keys it uses. A full VM backup containing the host secret and encrypted master credential can expose the vault too. Agree on encrypted off-host backup and separate key recovery. Losing the master key requires recovery or re-enrollment. Master-key rotation/re-encryption is not automated in this release.

## Connect a personal key

Visit `https://<MCP host>/portal/account` yourself, outside the agent chat. The proxy must forward this page, `/portal/account.js`, `/portal/account.css` and `/portal/api/*`, as well as `/mcp`, to the same loopback host. Add the public hostname to the allowed Host configuration. Do not log Authorization or credential request bodies.

Enter your separate human account token on the page. It is issued to the person, never configured in the agent. The account credential file uses the same `[{"subject":"stable-user-id","token":"<random-token>"}]` shape and 32-character minimum as MCP credentials. CLI startup refuses overlapping human/agent tokens or an account subject absent from the MCP identity list. Programmatic hosts must provide an independent `verifyAccountToken` verifier and keep token audiences disjoint.

Its authenticated subject determines whose settings you can manage. Each person must have a distinct subject; intentionally sharing a subject shares the Portal binding. Create a dedicated Portal API key in your Portal profile, enter it in the personal key field, and check the displayed Portal account name. The host verifies it using `GET /api/agents/me`.

The encrypted key cannot be fetched back, selected by another subject or read by an MCP tool. The page uses no localStorage/cookies for credentials and clears input fields after reading them. Reload clears the human token held in memory. Disconnect removes the binding and outstanding approvals but does not revoke the original Portal key: revoke it in the Portal profile too. Replacing the key also invalidates approvals, including on an already-open MCP connection.

Portal keys currently have all permissions of their owner. This release adds no per-key scopes, expiry or OAuth. The account page explicitly warns about this. Existing keys and key-management responses remain compatible.

## Prepare and approve

Only configured HTTP hosts expose:

| Tool | Behavior |
| --- | --- |
| `portal_connection_status` | Safe account/connection status for the authenticated subject |
| `portal_prepare_publication` | Accepts only `targetId`; captures the current rstool session and Portal schema and returns a change summary and approval-page path |

No MCP tool enrolls keys or confirms publication. Switch to the desired local session before preparation. Schema-error diagnostics block preparation. Preparations expire after ten minutes and are invalidated by local session changes, key changes or workspace disposal. There is one prepared proposal per workspace, bounded total JSON storage and bounded per-subject/global request queues. Pending proposals are lost on host restart.

On the separate account page, review the fixed API origin, target id, added/changed/removed aliases, metadata and complete before/after JSON. Approval sends the stored payload matching that digest. The confirmation request cannot override target or schema. Review conceptual correctness and brief requirements yourself; clean diagnostics alone are insufficient.

`POST /api/agents/rsforms/:id/publish` requires owner/staff access even for editors allowed by older routes. In one transaction it claims the observed `expected_time_update`, saves a version and replaces content. Shared RSForm mutation helpers now lock the library row before editing constituents, including on SQLite. A stale base returns 409 with no partial change or snapshot. This adds no optimistic-check requirement to legacy endpoints.

The host reads back persisted fields, metadata and attribution after publication and compares them with the requested replacement and response. Database-assigned IDs and resolved text are not compared literally with local IDs/text. One approval can issue at most one publication request. A network failure, conflict or verification failure becomes `uncertain` and cannot retry that approval. Inspect Portal before preparing another attempt, especially after a service restart.

Account APIs require the independent human bearer credential; an ordinary agent MCP token cannot access them even through raw HTTP. Writes additionally require the configured browser Origin. This is not MFA or proof of physical human presence: a stolen human token still grants its owner's settings/approval access. Protect and rotate that token separately; never send it to an agent.

## Explicit service identity

Optional `RSTOOL_PORTAL_SERVICE_KEY_FILE` points to a protected runtime credential, preferably delivered by `LoadCredentialEncrypted`. `RSTOOL_PORTAL_SERVICE_POLICY_FILE` points to nonsecret JSON:

```json
{ "subjects": ["explicit-service-subject"], "targetIds": [123] }
```

Replace the illustrative target with an authorized existing schema. Both settings are required together. Use a dedicated non-staff Portal account owning only the intended schemas. Listed subjects operate in service mode and cannot enroll a personal key. Other subjects require personal keys. Missing, revoked or invalid personal keys never fall back to the service key. Service identity is selected by trusted configuration, not tool arguments. Changes require restart and invalidate proposals.

Outgoing requests use a fixed HTTPS origin, normal certificate validation, deadlines and bounded response bodies. Redirects are refused. Transport headers, remote error bodies and credentials are not reflected in responses/logs. Incoming MCP tokens are never forwarded to Portal. Backend audit records the Portal key owner and target. Do not enable request-body debug logging on account routes.

## Verification before deployment

Use isolated test accounts/schemas: verify cross-user isolation, missing-key behavior, secret-free responses/logs/session exports, revocation on open connections, stale-base rejection, duplicate approval, correct service target restrictions, proxy routing and restoration of both encrypted data and the separately protected master key. No production Portal writes are needed for the local test suite.
