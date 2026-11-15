# Portal publication and private credentials

Optional integration for the HTTP host. The unconfigured HTTP service and stdio catalog are unchanged. Publication replaces an existing owned schema; it does not move objects or change access policies. Creation tools add empty objects as described in [Create and inspect library items](#create-and-inspect-library-items). Deploy the backend endpoints in this release before enabling it.

This is the scope of this MCP integration, not a limitation of Portal REST. A library folder is represented by each item's `location` string; there is no separate folder object to create. Portal REST supports `POST /api/agents/rsforms` to create an empty schema with its target `location`, followed by an initial content upload. See [new schema creation](../rstool/docs/PORTAL-PUBLISH.md#новая-кс). `create_session` creates an rstool session, not a Portal library item. When this adapter lacks a needed operation, use an independently authorized REST client or report that specific access gap. Never extract the bound key. Schema content is written by `portal_publish_schema` after the user explicitly accepts the change summary in the conversation. The account page binds the personal key. It is not required to approve each schema write.

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

## Create and inspect library items

Configured HTTP hosts expose `portal_create_schema`, `portal_create_model` and `portal_create_oss`. They create **empty** library objects through the existing personal Portal binding. Required arguments are `requestId`, `title`, `alias`, `location` and `accessPolicy`; `description` is optional. Model creation also requires `schemaId` of an existing readable conceptual schema. It creates a model linked to that schema, not a replacement schema or a local rstool session.

Use `portal_search_library(query, location?)` before creation to find accessible IDs, including private items. It returns the complete ID list from Portal's context search. Inspect selected matches with `portal_get_details(kind, targetId)`; do not enumerate IDs. `kind` is `schema`, `model` or `oss`. Location is a virtual library path, for example `/U/Дипломы/DEMO001`, not a separate folder object. Supply the intended access policy explicitly.

Creation requires a personal key with read and write scopes. The backend determines ownership, checks readable schema binding and location rights, applies quotas and records the mutation. Existing target-ID-scoped service grants do not authorize creation or general library search. No key or owner override is accepted by the MCP tools. Supply title, alias and description without leading or trailing whitespace: noncanonical metadata is rejected before POST because library creation trims these fields.

Choose a stable unique `requestId` of 8–128 letters, digits, underscores or hyphens. A subject-scoped receipt is persisted **before** POST; the returned ID is persisted **before** independent readback. Repeating the same ID and arguments reads the known result instead of sending POST again, including after host restart. Reusing the ID with different arguments, another Portal account or another API origin is rejected. Status reads also reject receipts from another origin; use separate host storage for a different Portal. These receipts store only a request digest, API origin, account ID, kind, state and created ID, never credentials or document contents.

After a timeout use `portal_get_creation_status(requestId)`. `created` gives the known ID; inspect it with `portal_get_details`. `uncertain` means that the POST outcome is unknown: search the library and reconcile it before starting any new request ID. Do not bypass the no-replay guard by changing IDs. A refusal or failed verification is not retried automatically. Local receipts are not server-side exactly-once creation across different request IDs or lost host storage.

Receipts live in `creations/` inside `RSTOOL_PORTAL_VAULT_DIR`. Preserve that directory across restarts and upgrades. Do not remove uncertain receipts to retry a POST. The HTTP timeout can end the caller's wait while the underlying operation is still completing; status and readback determine the result.

Creation returns `{requestId, kind, portalOrigin, targetId, verified, item}` after checking metadata against an independent GET. It does not import local contents. For a new schema, load the local session, show the user the target and the change summary, and after an explicit yes call `portal_publish_schema` with the returned ID. Read the new object back from the tool result. Stored expression errors are not silently corrected by creation.

Deploy the backend with `POST /api/agents/models` before using `portal_create_model`; older backends reject that route. Direct publication is part of `@rsconcept/rstool-mcp` 2.5.0 and requires updating and restarting the configured host. Merely updating these instructions does not update an installed service. The account page and `portal_prepare_publication` remain for key binding and old drafts.

## Publish a schema

Only configured HTTP hosts expose:

| Tool | Behavior |
| --- | --- |
| `portal_create_schema` | Create an empty conceptual schema at the supplied location; durable request ID and independent readback |
| `portal_create_model` | Create a model linked to `schemaId`; same receipt/readback protocol |
| `portal_create_oss` | Create an empty operation schema of synthesis; same receipt/readback protocol |
| `portal_get_creation_status` | Read a durable creation receipt without replaying POST |
| `portal_search_library` | Search accessible public/private objects with the bound personal key |
| `portal_get_details` | Read full details of a selected schema, model or OSS |
| `portal_get_description` | Accepts only `targetId`; reads description and `time_update` through the bound key, publicly without a key, or privately with a bound read-capable key, without a local session |
| `portal_update_description` | Accepts `targetId`, `expectedTimeUpdate`, `description`; updates only the description with CAS and independent readback, without a local rstool session or approval page |
| `portal_connection_status` | Safe account/connection status for the authenticated subject |
| `portal_publish_schema` | Accepts only `targetId`; replaces that schema with the current rstool session, then reads it back. Call it only after explicit user permission |
| `portal_prepare_publication` | Accepts only `targetId`; captures a draft and an account-page path. It does not write. Agents use `portal_publish_schema` instead |

No MCP tool enrolls keys or accepts an approval flag. Before `portal_publish_schema`, the agent shows the user the target ID, title, alias, location, `time_update`, the source session, constituent counts before and after, and every added, removed and changed alias, including a first load into an empty schema. The summary also names title, alias or description changes and states that every constituent is new when the target is empty. The agent waits for an explicit yes for that summary. A general request to upload files, without that summary, is not permission. Immediately before the call, the agent reads `portal_get_description` and checks that the current session is still the approved source. If `time_update` or the session differs from the accepted summary, the agent shows a new summary and waits for a new yes. The tool then writes immediately. Schema diagnostics, including errors, do not block the write. A successful readback does not certify the theory. The MCP path ends at that readback. It does not also call `create-version` or `replace`.

`portal_prepare_publication` remains for the account page. Its drafts expire after ten minutes and are invalidated by local session changes, key changes, workspace disposal and MCP disconnect. There is one prepared proposal per workspace. Agents do not send users through that page to publish schema content.

The account page still binds and disconnects the personal Portal key. That binding is separate from schema publication.

`portal_publish_schema` sends one `POST /api/agents/rsforms/:id/publish` for the current session. The host then reads the schema back and compares persisted fields, metadata and attribution with the requested replacement. Database-assigned IDs and resolved text are not compared literally with local IDs. A stale base returns 409 and does not write. A lost response or failed readback is uncertain: inspect Portal with `portal_get_details` before calling publish again. The tool does not retry. `POST /publish` requires owner or staff access. In one transaction it claims `expected_time_update`, saves a version and replaces content.

An old `portal_prepare_publication` draft can still be approved on the account page. That approval sends the stored payload for its digest and cannot override the target. It is not the agent path.

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

`portal_update_description` uses the same trusted subject and encrypted bound key as publication. It accepts no key, identity, schema or confirmation field. Personal and service target restrictions apply, as do Portal edit permissions. Connecting a key authorizes description edits and `portal_publish_schema`. Full schema replacement does not use the account page. The agent still needs explicit permission in the conversation before calling `portal_publish_schema`.

Call `portal_get_description(targetId)` to read the current description and `time_update` with the bound key before updating. This read uses Portal read permissions and the same personal/service target grants, exposes no credential or constituent data, and creates no local model. Pass its `time_update` as `expectedTimeUpdate` to the update tool. The backend `POST /api/agents/rsforms/:id/description` accepts only `{expected_time_update, description}`. The description is a required string, may be empty, preserves whitespace, and is limited to 100000 characters. In one transaction it conditionally updates only description and a strictly advancing timestamp, rechecks edit permission and audits the action. It creates no version snapshot and uses ordinary write quotas. Title, alias, items, formulas, attribution and access policy are unchanged. A stale revision returns 409 without writing.

The MCP host reads before writing, sends exactly one CAS request, then independently reads back and compares description and normalized schema content. Success returns `{targetId, description, time_update}`. A timeout, lost response or readback mismatch is uncertain; inspect Portal before making another call. No failed write is automatically repeated. Existing prepared full replacements retain their old base timestamp and will conflict after a description edit.

Install both the backend route and MCP adapter 2.1.0 to enable this tool. Existing database tables and credential files need no migration. Restart the single HTTP host after installation and refresh the client's tool catalog. Installing only the MCP adapter against an older backend returns a sanitized route failure; it never falls back to full replacement. Deployment and service administration remain outside this package.
