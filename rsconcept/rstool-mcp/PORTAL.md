# Portal publication and private credentials

Optional integration for the HTTP host. The unconfigured HTTP service and stdio catalog are unchanged. Publication replaces an existing owned schema; it does not create objects, move them, or change access policies. Deploy the backend endpoints in this release before enabling it.

This is the scope of this MCP integration, not a limitation of Portal REST. A library folder is represented by each item's `location` string; there is no separate folder object to create. Portal REST supports `POST /api/agents/rsforms` to create an empty schema with its target `location`, followed by an initial content upload. See [new schema creation](../rstool/docs/PORTAL-PUBLISH.md#новая-кс). `create_session` creates an rstool session, not a Portal library item. When this adapter lacks a needed operation, use an independently authorized REST client or report that specific access gap; never extract the bound key or bypass this integration's human approval flow.

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

CLI startup resolves configured paths, rejects overlapping vault/workspace directories and refuses master/human/service credential files inside either data tree. Runtime secret inputs must be regular files of bounded size; Unix group/other access bits are rejected for ordinary credential files. Linux systemd ACL credentials with mode 0440 are also accepted when they are root:root-owned, read-only, and immediate children of the canonical CREDENTIALS_DIRECTORY under /run/credentials. That directory must itself be root:root-owned, non-writable and inaccessible to other users. The access ACLs of both file and directory must grant access only to root and the current service UID, with no owning-group, named-group or other-user grants. The host reads only POSIX ACL metadata using isolated `python3` from the trusted service PATH (standard library, no external Python packages); Python is required only for this Linux ACL exception. Missing ACLs or an unavailable reader fail closed. The ACL read mask is not treated as ordinary shared-file access. This exception does not accept files elsewhere, writable credentials, world access or symlinks escaping the protected store. Human and agent token audiences must be disjoint. A configuration error is reported without file contents or secret values.

Encryption protects stored records, not a compromised process or root. The service can decrypt the keys it uses. A full VM backup containing the host secret and encrypted master credential can expose the vault too. Agree on encrypted off-host backup and separate key recovery. Losing the master key requires recovery or re-enrollment. Master-key rotation/re-encryption is not automated in this release.

## Connect a personal key

Visit `https://<MCP host>/portal/account` yourself, outside the agent chat. The proxy must forward this page, `/portal/account.js`, `/portal/account.css` and `/portal/api/*`, as well as `/mcp`, to the same loopback host. Add the public hostname to the allowed Host configuration. Do not log Authorization or credential request bodies.

Enter your separate human account token on the page. It is issued to the person, never configured in the agent. The account credential file uses the same `[{"subject":"stable-user-id","token":"<random-token>"}]` shape and 32-character minimum as MCP credentials. CLI startup refuses overlapping human/agent tokens or an account subject absent from the MCP identity list. Programmatic hosts must provide an independent `verifyAccountToken` verifier and keep token audiences disjoint.

Its authenticated subject determines whose settings you can manage. Each person must have a distinct subject; intentionally sharing a subject shares the Portal binding. Create a dedicated Portal API key in your Portal profile, enter it in the personal key field, and check the displayed Portal account name. The host verifies it using `GET /api/agents/me`.

The encrypted key cannot be fetched back, selected by another subject or read by an MCP tool. The page uses no localStorage/cookies for credentials and clears input fields after reading them. Reload clears the human token held in memory. Disconnect removes the binding and outstanding approvals but does not revoke the original Portal key: revoke it in the Portal profile too. Replacing the key also invalidates approvals, including on an already-open MCP connection.

Public data reads require no Portal key. When a key is provided, its read, write and publish scopes can restrict its owner’s existing rights. Expired or revoked keys cannot authenticate. Existing keys retain their prior scopes and no expiration; new keys can select scopes and an expiration in the Portal profile. The account page displays bound-key policy when the backend provides it. Portal enforces current policy on every request; cached MCP metadata is only an early hint. OAuth is not implemented.

## Prepare and approve

Only configured HTTP hosts expose:

| Tool | Behavior |
| --- | --- |
| `portal_get_description` | Accepts only `targetId`; reads description and `time_update` through the bound key, publicly without a key, or privately with a bound read-capable key, without a local session |
| `portal_update_description` | Accepts `targetId`, `expectedTimeUpdate`, `description`; updates only the description with CAS and independent readback, without a local rstool session or approval page |
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

Replace the illustrative target with an authorized existing schema. Both settings are required together. Use a dedicated non-staff Portal account owning only the intended schemas. Listed subjects operate in service mode and cannot enroll a personal key. Other subjects require personal keys for private reads and writes. Description editing and full publication need read in addition to their mutation scope because the workflow verifies target details first. Missing, revoked or invalid personal keys never fall back to the service key. Service identity is selected by trusted configuration, not tool arguments. Changes require restart and invalidate proposals.

Outgoing requests use a fixed HTTPS origin, normal certificate validation, deadlines and bounded response bodies. Redirects are refused. Transport headers, remote error bodies and credentials are not reflected in responses/logs. Incoming MCP tokens are never forwarded to Portal. Backend audit records the Portal key owner and target. Do not enable request-body debug logging on account routes.

## Verification before deployment

Use isolated test accounts/schemas: verify cross-user isolation, missing-key behavior, secret-free responses/logs/session exports, revocation on open connections, stale-base rejection, duplicate approval, correct service target restrictions, proxy routing and restoration of both encrypted data and the separately protected master key. No production Portal writes are needed for the local test suite.


## Description-only edits

`portal_update_description` uses the same trusted subject and encrypted bound key as publication. It accepts no key, identity, schema or confirmation field. Personal and service target restrictions apply, as do Portal edit permissions. Connecting a key authorizes this direct description capability; full replacement still requires the separate human approval page. Client approval policy remains the client's responsibility.

Call `portal_get_description(targetId)` to read the current description and `time_update` with the bound key before updating. This read uses Portal read permissions and the same personal/service target grants, exposes no credential or constituent data, and creates no local model. Pass its `time_update` as `expectedTimeUpdate` to the update tool. The backend `POST /api/agents/rsforms/:id/description` accepts only `{expected_time_update, description}`. The description is a required string, may be empty, preserves whitespace, and is limited to 100000 characters. In one transaction it conditionally updates only description and a strictly advancing timestamp, rechecks edit permission and audits the action. It creates no version snapshot and uses ordinary write quotas. Title, alias, items, formulas, attribution and access policy are unchanged. A stale revision returns 409 without writing.

The MCP host reads before writing, sends exactly one CAS request, then independently reads back and compares description and normalized schema content. Success returns `{targetId, description, time_update}`. A timeout, lost response or readback mismatch is uncertain; inspect Portal before making another call. No failed write is automatically repeated. Existing prepared full replacements retain their old base timestamp and will conflict after a description edit.

Install both the backend route and MCP adapter 2.1.0 to enable this tool. Existing database tables and credential files need no migration. Restart the single HTTP host after installation and refresh the client's tool catalog. Installing only the MCP adapter against an older backend returns a sanitized route failure; it never falls back to full replacement. Deployment and service administration remain outside this package.
