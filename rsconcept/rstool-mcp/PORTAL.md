# Portal publication and private credentials

Optional integration for the HTTP host. The unconfigured HTTP service and stdio catalog are unchanged. Publication replaces an existing owned schema; it does not move objects or change access policies. Creation tools add empty objects as described in [Create and inspect library items](#create-and-inspect-library-items). Deploy the backend endpoints in this release before enabling it.

Portal REST supports `POST /api/agents/rsforms` to create a schema at its target `location`, with optional contents in the same transaction. Use the prepared publication flow to replace an existing schema after the user accepts its change summary. Account credentials stay in the MCP host. A separately authorized REST client can call the Portal API directly. [New schema creation](../rstool/docs/PORTAL-PUBLISH.md#новая-кс)

## Access and current publishing tools

Use portal_preflight before a protected operation. It checks Portal identity and metadata access, and can ask Portal to confirm edit or publication rights. Choose audience public for anonymous reads. The protected binding belongs to the authenticated user and project. See [diagnostic codes](../rstool/docs/PORTAL-READ.md#проверка-доступа-до-записи).

Roll out the Portal migrations and API first, followed by rstool 3.3 and the MCP 2.10 adapter. The prepared flow checks the API's `mutation_receipts` capability. MCP 2.10 deprecates `portal_publish_schema(targetId)` and retains it for 2.x callers. Remove it in MCP 3.0 after confirming that clients have migrated to the prepared flow. Portal retains committed receipts for the lifetime of the account and checks current read access on lookup. [Receipt protocol](../rstool/docs/PORTAL-PUBLISH.md#квитанции-и-повтор-запроса)

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

Public data reads require no Portal key. In the Portal profile, choose **Read only** for inspection or **Read and write** for creating, editing, and publishing schemas. The account page displays bound-key policy. Portal enforces scopes, expiration and object permissions on every request. The delegated alternative is documented below.

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

Choose a stable requestId and preserve the local receipts in creations/ inside the vault. Portal commits the receipt with the item. Recover the target ID with portal_get_creation_status after a lost reply. If replaying a creation, reuse the same requestId and arguments. Legacy uncertain receipts may require a library search.

Use portal_create_schema_from_session to create and initialize a new schema. Review the intended title, alias, location, access policy and contents with the user first. To finish an existing empty item, use its saved ID in the publication workflow. Verify the revision, contents and library metadata by independent readback.

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
| `portal_preflight` | Check account access and object capability using metadata |
| `portal_create_schema_from_session` | Create and initialize a new schema in one transaction |
| `portal_prepare_publication` | Capture target revision, source session and change summary |
| `portal_apply_publication` | Apply the agreed `publicationId` and `digest` |
| `portal_get_publication_status` | Read the committed receipt and independently check the target |
| `portal_publish_schema` | Deprecated compatibility tool accepting `targetId` |

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

Call `portal_prepare_publication(targetId)` and show its summary to the user. Include the target, source session, expected revision, metadata changes and constituent changes. If the description preview is truncated, inspect the source text before asking for approval. Pass `publicationId` and `digest` to `portal_apply_publication` in the preparing workspace within ten minutes. The adapter checks the live source export and credential. Portal checks the agreed revision and metadata while locking the item, saves one snapshot, and commits the change and receipt together.

If the source, target or credential changes, prepare and agree to a new summary. On timeout, call `portal_get_publication_status` from the same project and reread the target. A returned `state: published` confirms the committed write even when `verified: false` reports a difference from the current revision or metadata. For an explicit service grant, status lookup also requires the draft to remain in the host's memory so the adapter can verify the allowed target. Schema diagnostics do not block publishing. The account page can still approve drafts via the legacy flow during the compatibility window.

## OAuth pilot

Portal is the authorization server for pre-registered public clients. It displays the approved project and scopes, checks exact registered redirect URIs, and requires S256 PKCE. Set `AGENT_MCP_OAUTH_CONFIG` to the path of a protected JSON file and `AGENT_MCP_OAUTH_SERVICE_SECRET` to the path of a protected file holding an independent random service secret with at least 32 characters.

    {
      "issuer": "https://api.portal.example",
      "mcp_origin": "https://mcp.example",
      "clients": {
        "desktop-pilot": {
          "redirect_uris": ["http://127.0.0.1:38737/callback"],
          "projects": {"research": {"users": [7], "scopes": ["read", "write"]}}
        }
      }
    }

On the MCP host, point RSTOOL_MCP_OAUTH_SERVICE_SECRET_FILE to the same secret in a protected file. Route /.well-known/oauth-protected-resource and its /mcp variants to MCP. Route /.well-known/oauth-authorization-server to Portal. Register the client's actual callback. Every client bearer has the exact MCP workspace URL as its audience. Different workspace URLs have distinct sessions even when their Portal account and project are the same. After 30 minutes the client starts authorization again using the existing Portal browser session. Existing REST keys and project API-key bindings remain available.

The MCP host introspects its bearer and receives a separate Portal-only credential. Portal enforces the current account, grant, scopes and object permissions on every protected operation. Revoke Portal access in /api/agents/oauth/grants. The MCP bearer remains valid for opening saved sessions until it expires. Removing project membership or deactivating the Portal account ends MCP authorization too. Use matching accounts of the form portal:<account ID> in static credentials only when intentionally sharing the same workspace.

The pilot uses pre-registration and starts a new code flow on expiry. With several registered projects, a client that supports additional authorization parameters can send `project=<id>` to the Portal authorization endpoint. Portal checks membership and requested scopes, then reuses active consent for that project. Without the parameter the user chooses the project in Portal. [MCP OAuth discovery and resource requirements](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)

## Explicit service identity

Optional `RSTOOL_PORTAL_SERVICE_KEY_FILE` points to a protected runtime credential, preferably delivered by `LoadCredentialEncrypted`. `RSTOOL_PORTAL_SERVICE_POLICY_FILE` points to nonsecret JSON:

```json
{ "subjects": ["explicit-service-subject"], "targetIds": [123] }
```

Replace the illustrative target with an authorized existing schema. Both settings are required together. Use a dedicated non-staff Portal account owning only the intended schemas. Listed subjects operate in service mode and are ineligible for personal or project key enrollment. Other subjects require personal keys for private reads and writes. Description editing and full publication need both `read` and `write` because the workflow verifies target details. Missing, revoked or invalid personal keys never fall back to the service key. Service identity is selected by trusted configuration, not tool arguments. Changes require restart and invalidate proposals.

Portal data requests use a fixed HTTPS origin, normal certificate validation, deadlines and bounded response bodies. The client refuses redirects and sanitizes remote errors. For the OAuth pilot, the MCP token is sent to the issuer's introspection endpoint, and the Portal data API receives a separate delegated credential. Backend audit records the actor and target. Keep request-body debug logging disabled on account and OAuth credential routes.

## Verification before deployment

Use isolated test accounts/schemas: verify cross-user isolation, missing-key behavior, secret-free responses/logs/session exports, revocation on open connections, stale-base rejection, duplicate approval, correct service target restrictions, proxy routing and restoration of both encrypted data and the separately protected master key. No production Portal writes are needed for the local test suite.


## Description-only edits

`portal_update_description` uses the authenticated subject and its trusted credential. Portal applies object edit permissions and the expected description revision. For full replacement, follow the prepared publication protocol after explicit user consent.

Call `portal_get_description(targetId)` to read the current description and `time_update` with the bound key before updating. This read uses Portal read permissions and the same personal/service target grants, exposes no credential or constituent data, and creates no local model. Pass its `time_update` as `expectedTimeUpdate` to the update tool. The backend `POST /api/agents/rsforms/:id/description` accepts only `{expected_time_update, description}`. The description is a required string, may be empty, preserves whitespace, and is limited to 100000 characters. In one transaction it conditionally updates only description and a strictly advancing timestamp, rechecks edit permission and audits the action. It creates no version snapshot and uses ordinary write quotas. Title, alias, items, formulas, attribution and access policy are unchanged. A stale revision returns 409 without writing.

The MCP host reads before writing, sends exactly one CAS request, then independently reads back and compares description and normalized schema content. Success returns `{targetId, description, time_update}`. A timeout, lost response or readback mismatch is uncertain; inspect Portal before making another call. No failed write is automatically repeated. Existing prepared full replacements retain their old base timestamp and will conflict after a description edit.

Install both the backend route and MCP adapter 2.1.0 to enable this tool. Existing database tables and credential files need no migration. Restart the single HTTP host after installation and refresh the client's tool catalog. Installing only the MCP adapter against an older backend returns a sanitized route failure; it never falls back to full replacement. Deployment and service administration remain outside this package.
