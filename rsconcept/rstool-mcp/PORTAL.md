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

Personal and project credentials use AES-256-GCM, fresh random IVs, authenticated binding to their owner and scope, atomic replacement and mode-0600 files in a mode-0700 directory. Provision correct ownership; permissions of an existing directory are not automatically repaired. Workspace JSON contains no Portal credentials. Environment variables contain paths, not secret values.

CLI startup resolves configured paths, rejects overlapping vault/workspace directories and refuses master/human/service credential files inside either data tree. Runtime secret inputs must be regular files of bounded size; Unix group/other access bits are rejected for ordinary credential files. Linux systemd ACL credentials with mode 0440 are also accepted when they are root:root-owned, read-only, and immediate children of the canonical CREDENTIALS_DIRECTORY under /run/credentials. That directory must itself be root:root-owned, non-writable and inaccessible to other users. The access ACLs of both file and directory must grant access only to root and the current service UID, with no owning-group, named-group or other-user grants. The host reads only POSIX ACL metadata using isolated `python3` from the trusted service PATH (standard library, no external Python packages); Python is required only for this Linux ACL exception. Missing ACLs or an unavailable reader fail closed. The ACL read mask is not treated as ordinary shared-file access. This exception does not accept files elsewhere, writable credentials, world access or symlinks escaping the protected store. Human and agent token audiences must be disjoint. A configuration error is reported without file contents or secret values.

Encryption protects stored records, not a compromised process or root. The service can decrypt the keys it uses. A full VM backup containing the host secret and encrypted master credential can expose the vault too. Agree on encrypted off-host backup and separate key recovery. Losing the master key requires recovery or re-enrollment. Master-key rotation/re-encryption is not automated in this release.

## Connect a personal key

Visit `https://<MCP host>/portal/account` yourself, outside the agent chat. The proxy must forward this page, `/portal/account.js`, `/portal/account.css` and `/portal/api/*`, as well as `/mcp`, to the same loopback host. Add the public hostname to the allowed Host configuration. Do not log Authorization or credential request bodies.

Enter your separate human account token on the page. It is issued to the person, never configured in the agent. The account credential file uses the same `[{"subject":"stable-user-id","token":"<random-token>"}]` shape and 32-character minimum as MCP credentials. CLI startup refuses overlapping human/agent tokens or an account subject absent from the MCP identity list. Programmatic hosts must provide an independent `verifyAccountToken` verifier and keep token audiences disjoint.

Its authenticated subject determines whose settings you can manage. Each person must have a distinct subject; intentionally sharing a subject shares the Portal binding. Create a dedicated Portal API key in your Portal profile, enter it in the personal key field, and check the displayed Portal account name. The host verifies it using `GET /api/agents/me`.

The encrypted key cannot be fetched back, selected by another subject or read by an MCP tool. The page uses no localStorage/cookies for credentials and clears input fields after reading them. Reload clears the human token held in memory. Disconnect removes the binding and outstanding approvals but does not revoke the original Portal key: revoke it in the Portal profile too. Replacing the key also invalidates approvals, including on an already-open MCP connection.

Public data reads require no Portal key. In the Portal profile, choose **Read only** for inspection or **Read and write** for creating, editing, and publishing schemas with `portal_publish_schema`. Issued keys retain their `read` and `write` permissions and expiry. Expired or revoked keys cannot authenticate. The account page displays bound-key policy when the backend provides it. Portal enforces scopes, expiration and the owner’s object permissions on every request. Cached MCP metadata is an early hint. OAuth is not implemented.

## Connect a project

Configure the MCP connection in the AI client's project settings so its chats use the same authenticated project. Use trusted client identity or a project-scoped bearer token as described in [HTTP configuration](HTTP.md#configure-the-service). Give concurrently active chats different MCP workspace names. The workspace URL selects rstool storage. Verified authentication selects the Portal connection for the user and project.

1. From any project chat, call `portal_connection_status` and open its `connectionPage`. Sign in with the separate human account token, verify the selected project, and enter the Portal API key in the protected form.
2. From another chat in the project, call `portal_connection_status` to verify the connected account and scopes. Use the Portal tools normally. Each operation keeps its own approval requirements and Portal checks the key and target permissions on every API request.
3. To replace or disconnect the key, select that project on the same account page. The next operation in any chat uses the new connection state. An operation already sent to Portal can complete. Revoke the original key in Portal if it must stop working outside this connection too.

Each project binding belongs to one authenticated user. A separate personal binding, another project or another user's binding never supplies the key. The status returns the safe account and key policy, and reports `not_connected`, `key_expired`, `key_invalid_or_revoked` or `portal_unavailable` when appropriate. Management on the account page is restricted to the projects associated with the authenticated human account by the host.

## Create and inspect library items

Configured HTTP hosts expose `portal_create_schema`, `portal_create_model` and `portal_create_oss`. They create **empty** library objects through the active personal or project connection. Required arguments are `requestId`, `title`, `alias`, `location` and `accessPolicy`; `description` is optional. Model creation also requires `schemaId` of an existing readable conceptual schema.

Use `portal_search_library(query, location?)` before creation to find accessible IDs, including private items. It returns the complete ID list from Portal's context search. Inspect selected matches with `portal_get_details(kind, targetId)`; do not enumerate IDs. `kind` is `schema`, `model` or `oss`. Location is a virtual library path, for example `/U/Дипломы/DEMO001`, not a separate folder object. Supply the intended access policy explicitly.

Creation requires a personal key with read and write scopes. The backend determines ownership, checks readable schema binding and location rights, applies quotas and records the mutation. Existing target-ID-scoped service grants do not authorize creation or general library search. No key or owner override is accepted by the MCP tools. Supply title, alias and description without leading or trailing whitespace: noncanonical metadata is rejected before POST because library creation trims these fields.

Choose a stable unique `requestId` of 8–128 letters, digits, underscores or hyphens. The active connection scope determines the receipt namespace. The host persists the receipt before POST and records the returned ID before independent readback. Repeating the same ID and arguments reads the known result instead of sending POST again, including after host restart. Reusing the ID with different arguments, another Portal account or another API origin is rejected. Status reads also reject receipts from another origin; use separate host storage for a different Portal. These receipts store only a request digest, API origin, account ID, kind, state and created ID, never credentials or document contents.

After a timeout use `portal_get_creation_status(requestId)`. `created` gives the known ID; inspect it with `portal_get_details`. `uncertain` means that the POST outcome is unknown: search the library and reconcile it before starting any new request ID. Do not bypass the no-replay guard by changing IDs. A refusal or failed verification is not retried automatically. Local receipts are not server-side exactly-once creation across different request IDs or lost host storage.

Receipts live in `creations/` inside `RSTOOL_PORTAL_VAULT_DIR`. Preserve that directory across restarts and upgrades. Do not remove uncertain receipts to retry a POST. The HTTP timeout can end the caller's wait while the underlying operation is still completing; status and readback determine the result.

Creation returns `{requestId, kind, portalOrigin, targetId, verified, item}` after checking metadata against an independent GET. It does not import local contents. For a new schema, load the local session, show the user the target and the change summary, and after an explicit yes call `portal_publish_schema` with the returned ID. Read the new object back from the tool result. Stored expression errors are not silently corrected by creation.

Deploy the backend with `POST /api/agents/models` before using `portal_create_model`; older backends reject that route. Direct publication is part of `@rsconcept/rstool-mcp` 2.5.0 and requires updating and restarting the configured host. Merely updating these instructions does not update an installed service. The account page and `portal_prepare_publication` remain for key binding and old drafts.

## Portal tools

Only configured HTTP hosts expose:

| Tool | Behavior |
| --- | --- |
| `portal_create_schema` | Create an empty conceptual schema at the supplied location; durable request ID and independent readback |
| `portal_create_model` | Create a model linked to `schemaId`; same receipt/readback protocol |
| `portal_create_oss` | Create an empty operation schema of synthesis; same receipt/readback protocol |
| `portal_get_creation_status` | Read a durable creation receipt without replaying POST |
| `portal_search_library` | Search accessible public/private objects with the bound personal key |
| `portal_get_details` | Read full details of a selected schema, model or OSS |
| `portal_oss_create_schema` | Add an input operation with a new empty conceptual schema |
| `portal_oss_import_schema` | Add an input operation linked to an existing schema or a copy of it |
| `portal_oss_create_synthesis` | Add and run a synthesis with ordered argument operations and constituent substitutions |
| `portal_oss_update_operation` | Edit operation metadata or change arguments and substitutions |
| `portal_oss_execute_operation` | Rebuild the result of an existing synthesis operation |
| `portal_create_constituent` | Append a constituent to an editable schema, including a synthesis result |
| `portal_update_constituent` | Edit the supplied fields of one own constituent by ID |
| `portal_get_description` | Accepts only `targetId`; reads description and `time_update` through the bound key, publicly without a key, or privately with a bound read-capable key, without a local session |
| `portal_update_description` | Accepts `targetId`, `expectedTimeUpdate`, `description`; updates only the description with CAS and independent readback, without a local rstool session or approval page |
| `portal_connection_status` | Safe account and status for the authenticated personal or project connection |
| `portal_set_model_values` | Set interpretation values on an existing Portal model using a revision guard and independent readback |
| `portal_publish_schema` | Accepts only `targetId`; replaces that schema with the current rstool session, then reads it back. Call it only after explicit user permission |
| `portal_prepare_publication` | Accepts only `targetId`; captures a draft and an account-page path. It does not write. Agents use `portal_publish_schema` instead |

## Set model values

Read the model with `portal_get_details` using `kind: "model"` and read its linked schema to obtain constituent IDs. Call `portal_set_model_values` with the model `targetId`, its exact `time_update` as `expectedTimeUpdate`, and `values` containing one `{target, type, data}` entry per constituent. The host uses the [Portal interpretation format](../rstool/docs/PORTAL-MODELS.md) and checks the revision and stored values in a separate model read. A stale write is rejected. If the result is uncertain, read the model before deciding whether to retry.

## Edit an OSS graph

Graph tools use the bound personal key with read and write scopes. Portal enforces edit rights on the OSS and read rights on imported schemas. The tools work without a local rstool session. Before editing, show the user the OSS, its revision and the planned operations, then obtain explicit permission.

Portal checks current read access to the argument schemas when synthesizing. A result can be shared only with readers who can read all its sources. If a source is restricted later, readers who lose access also lose access to schemas still inheriting its contents, including in search.

1. Read `portal_get_details(kind: "oss", targetId: …)`. Use its `time_update` as `expectedTimeUpdate` for the next graph call. A concurrent edit returns a conflict. Read the revised graph and obtain acceptance for changes against that revision.
2. Use `portal_oss_create_schema` with `item_data` to add a blank argument, or `portal_oss_import_schema` with `item_data`, a Portal schema ID in `source`, and an explicit `clone_source`. An `item_data` object can include `alias`, `title`, `description` and `parent` (block ID or null). Portal places new nodes automatically. For a local argument, load it into rstool and publish it to the new input operation's `resultId` using the schema publication workflow.
3. Call `portal_oss_create_synthesis` with `item_data`, the input operation IDs in `arguments`, and an optional `substitutions` array of `{original, substitution}`. Substitutions use constituent IDs from each argument schema's Portal details. `original` is the constituent to replace. `substitution` is the one to retain. To edit or rerun the synthesis, use the affected operation ID in `target`.

All graph calls take the OSS `targetId` and `expectedTimeUpdate`. They send the latter as `X-Expected-Time-Update` and read the graph independently after writing. The result contains `targetId`, `operationId`, `resultId`, `time_update`, `verified` and the read-back `oss`. Read a resulting conceptual schema with `portal_get_details(kind: "schema", targetId: …)` to verify its contents. After a timeout or failed readback, inspect the graph before any retry. The adapter sends a mutation at most once per call.

## Append or edit one constituent

Read the schema with `portal_get_details(kind: "schema", targetId: …)`. Show the user the schema, the revision and the constituent fields to change. After explicit approval, pass that `time_update` as `expectedTimeUpdate`. Both tools need read and write access and work without an rstool session. Deploy the backend with revision checks on the constituent routes before using the tools.

- `portal_create_constituent` takes `targetId`, `expectedTimeUpdate` and `item_data`. Supply an unused `alias` and `cst_type`, for example `term`. To add a term belonging to the result of a synthesis, use that result schema's ID.
- `portal_update_constituent` also takes `constituentId` from the schema's `items`. Supply only changed fields in `item_data`. Edit an inherited constituent in its source schema, where Portal can propagate the change through the graph.

Text fields use Portal names such as `term_raw`, `definition_raw`, `definition_formal` and `convention`. Use an empty string to clear a field. The tools return the constituent, its ID and the new schema revision after an independent read. On a conflict, timeout or failed verification, inspect the schema before retrying. Rebuilding a synthesis can create a new result schema. Add its own terms after building the result and check the result ID if rebuilding it later.

## Publish a schema

No MCP tool enrolls keys or accepts an approval flag. Before `portal_publish_schema`, the agent shows the user the target ID, title, alias, location, `time_update`, the source session, constituent counts before and after, and every added, removed and changed alias, including a first load into an empty schema. The summary also names title, alias or description changes and states that every constituent is new when the target is empty. The agent waits for an explicit yes for that summary. A general request to upload files, without that summary, is not permission. Immediately before the call, the agent reads `portal_get_description` and checks that the current session is still the approved source. If `time_update` or the session differs from the accepted summary, the agent shows a new summary and waits for a new yes. The tool then writes immediately. Schema diagnostics, including errors, do not block the write. A successful readback does not certify the theory. The MCP path ends at that readback. It does not also call `create-version` or `replace`.

`portal_prepare_publication` remains for the account page. Its drafts expire after ten minutes and are invalidated by local session changes, key changes, workspace disposal and MCP disconnect. There is one prepared proposal per workspace. Agents do not send users through that page to publish schema content.

The account page still binds and disconnects the personal Portal key. That binding is separate from schema publication.

`portal_publish_schema` sends one `POST /api/agents/rsforms/:id/publish` for the current session. The host then reads the schema back and compares persisted fields, metadata and attribution with the requested replacement. Database-assigned IDs and resolved text are not compared literally with local IDs. A stale base returns 409 and does not write. A lost response or failed readback is uncertain: inspect Portal with `portal_get_details` before calling publish again. The tool does not retry. `POST /publish` requires the `write` scope and owner or staff edit access. In one transaction it claims `expected_time_update`, saves a version and replaces content.

An old `portal_prepare_publication` draft can still be approved on the account page. That approval sends the stored payload for its digest and cannot override the target. It is not the agent path.

Account APIs require the independent human bearer credential; an ordinary agent MCP token cannot access them even through raw HTTP. Writes additionally require the configured browser Origin. This is not MFA or proof of physical human presence: a stolen human token still grants its owner's settings/approval access. Protect and rotate that token separately; never send it to an agent.

## Explicit service identity

Optional `RSTOOL_PORTAL_SERVICE_KEY_FILE` points to a protected runtime credential, preferably delivered by `LoadCredentialEncrypted`. `RSTOOL_PORTAL_SERVICE_POLICY_FILE` points to nonsecret JSON:

```json
{ "subjects": ["explicit-service-subject"], "targetIds": [123] }
```

Replace the illustrative target with an authorized existing schema. Both settings are required together. Use a dedicated non-staff Portal account owning only the intended schemas. Listed subjects operate in service mode and cannot enroll a personal key. Other subjects require personal keys for private reads and writes. Description editing and full publication need both `read` and `write` because the workflow verifies target details. Missing, revoked or invalid personal keys never fall back to the service key. Service identity is selected by trusted configuration, not tool arguments. Changes require restart and invalidate proposals.

Outgoing requests use a fixed HTTPS origin, normal certificate validation, deadlines and bounded response bodies. Redirects are refused. Transport headers, remote error bodies and credentials are not reflected in responses/logs. Incoming MCP tokens are never forwarded to Portal. Backend audit records the Portal key owner and target. Do not enable request-body debug logging on account routes.

## Verification before deployment

Use isolated test accounts/schemas: verify cross-user isolation, missing-key behavior, secret-free responses/logs/session exports, revocation on open connections, stale-base rejection, duplicate approval, correct service target restrictions, proxy routing and restoration of both encrypted data and the separately protected master key. No production Portal writes are needed for the local test suite.


## Description-only edits

`portal_update_description` uses the same trusted subject and encrypted bound key as publication. It accepts no key, identity, schema or confirmation field. Personal and service target restrictions apply, as do Portal edit permissions. Connecting a key authorizes description edits and `portal_publish_schema`. Full schema replacement does not use the account page. The agent still needs explicit permission in the conversation before calling `portal_publish_schema`.

Call `portal_get_description(targetId)` to read the current description and `time_update` with the bound key before updating. This read uses Portal read permissions and the same personal/service target grants, exposes no credential or constituent data, and creates no local model. Pass its `time_update` as `expectedTimeUpdate` to the update tool. The backend `POST /api/agents/rsforms/:id/description` accepts only `{expected_time_update, description}`. The description is a required string, may be empty, preserves whitespace, and is limited to 100000 characters. In one transaction it conditionally updates only description and a strictly advancing timestamp, rechecks edit permission and audits the action. It creates no version snapshot and uses ordinary write quotas. Title, alias, items, formulas, attribution and access policy are unchanged. A stale revision returns 409 without writing.

The MCP host reads before writing, sends exactly one CAS request, then independently reads back and compares description and normalized schema content. Success returns `{targetId, description, time_update}`. A timeout, lost response or readback mismatch is uncertain; inspect Portal before making another call. No failed write is automatically repeated. Existing prepared full replacements retain their old base timestamp and will conflict after a description edit.

Install both the backend route and MCP adapter 2.1.0 to enable this tool. Existing database tables and credential files need no migration. Restart the single HTTP host after installation and refresh the client's tool catalog. Installing only the MCP adapter against an older backend returns a sanitized route failure; it never falls back to full replacement. Deployment and service administration remain outside this package.
