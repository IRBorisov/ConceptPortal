import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash, randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

import { RSToolError, type RSToolAgent } from '@rsconcept/rstool';

import { PORTAL_CREATE_OPERATIONS, PORTAL_ITEM_TYPES, portalFailure, PortalClient, PortalHttpError,
  type PortalItemKind, type PortalOssAction } from '@rsconcept/rstool/portal';
import { PortalCreations } from './portal-creations';
import { isPortalKeyScope, PortalVault, type PortalCredential, type PortalKeyPolicy, type PortalOwner } from './portal-vault';

export interface ServicePortalCredential {
  token: string;
  subjects: readonly string[];
  targetIds: readonly number[];
}

interface PreparedPublication {
  id: string;
  subject: string;
  workspace: string;
  targetId: number;
  generation: string;
  expiresAt: number;
  digest: string;
  session: string;
  sourceId: string;
  tool: RSToolAgent;
  validateSource?: () => void;
  before: Record<string, any>;
  after: Record<string, any>;
  state: 'prepared' | 'sending' | 'published' | 'uncertain' | 'failed';
  result?: unknown;
}

/** Own the external publication lifecycle; RS validation and editing stay in rstool. */
export class PortalPublisher {
  readonly #vault: PortalVault;
  readonly #delegation = new AsyncLocalStorage<{ owner: string; credential: PortalCredential | null }>();
  readonly #api: PortalClient;
  readonly #service?: ServicePortalCredential;
  readonly #creations?: PortalCreations;
  readonly #drafts = new Map<string, PreparedPublication>();
  readonly #tails = new Map<string, Promise<unknown>>();
  readonly #preparations = new Set<{ subject: string; workspace: string; invalidated: boolean }>();
  #pending = 0;
  readonly #counts = new Map<string, number>();

  /** Validate and copy administrator-only service grants, without accepting runtime tool overrides. */
  public constructor(vault: PortalVault, api: PortalClient, service?: ServicePortalCredential, creations?: PortalCreations) {
    if (
      service &&
      (typeof service.token !== 'string' ||
        !/^rcp_[A-Za-z0-9_-]{20,200}$/.test(service.token) ||
        !Array.isArray(service.subjects) ||
        !service.subjects.length ||
        service.subjects.some((subject) => typeof subject !== 'string' || !subject.trim()) ||
        !Array.isArray(service.targetIds) ||
        !service.targetIds.length ||
        service.targetIds.some((id) => !Number.isSafeInteger(id) || id <= 0))
    ) {
      throw new Error('Service publication needs explicit subjects and target IDs');
    }
    this.#vault = vault;
    this.#api = api;
    this.#creations = creations;
    this.#service = service
      ? { ...service, subjects: [...service.subjects], targetIds: [...service.targetIds] }
      : undefined;
  }

  public withDelegation<T>(subject: PortalOwner, credential: PortalCredential | null, action: () => T): T {
    return this.#delegation.run({ owner: JSON.stringify(subject), credential }, action);
  }

  private delegated(subject: PortalOwner) {
    const current = this.#delegation.getStore();
    return current?.owner === JSON.stringify(subject) ? current : undefined;
  }

  private boundCredential(subject: PortalOwner) {
    const delegation = this.delegated(subject);
    return delegation ? delegation.credential : this.#vault.get(subject);
  }

  /** Bind an entered key to the authenticated subject after verifying its Portal account. */
  public connect(subject: PortalOwner, token: string) {
    return this.exclusive(subject, async () => {
      if (this.isService(subject)) throw new Error('This identity has an administrator-managed service credential');
      if (typeof token !== 'string' || !/^rcp_[A-Za-z0-9_-]{20,200}$/.test(token))
        throw new Error('Invalid Portal key');
      const { account, keyPolicy } = await this.readIdentity(token);
      if (keyPolicy?.expiresAt && Date.parse(keyPolicy.expiresAt) <= Date.now()) throw new Error('Portal key expired');
      this.#vault.set(subject, token, account, keyPolicy);
      this.invalidateSubject(subject);
      return this.connection(subject);
    });
  }

  /** Disconnect locally; revocation of the original key is done in the Portal profile. */
  public disconnect(subject: PortalOwner) {
    return this.exclusive(subject, async () => {
      if (this.isService(subject)) throw new Error('Service credentials are managed by the administrator');
      this.#vault.remove(subject);
      this.invalidateSubject(subject);
      return { connected: false };
    });
  }

  /** Safe status only: no secret, encrypted value, or credential-file location. */
  public connection(subject: PortalOwner) {
    if (this.isService(subject)) return { connected: true, mode: 'service' };
    const scope = typeof subject === 'string' ? { mode: 'personal' } : { mode: 'project', projectId: subject[1] };
    const credential = this.boundCredential(subject);
    return credential
      ? { ...scope, connected: !expired(credential), account: credential.account,
          ...(credential.keyPolicy ? { keyPolicy: credential.keyPolicy, expired: expired(credential) } : {}) }
      : { ...scope, connected: false };
  }

  /** Project status checks the live key so revocation is visible in every chat. */
  public verifyConnection(subject: PortalOwner) {
    if (typeof subject === 'string') return this.connection(subject);
    const delegated = !!this.delegated(subject);
    const project = { mode: 'project', projectId: subject[1], ...(delegated ? { authentication: 'oauth' } : {}) };
    return this.exclusive(subject, async () => {
      const credential = this.boundCredential(subject);
      if (!credential) return { ...project, connected: false, reason: delegated ? 'delegation_revoked' : 'not_connected' };
      const saved = { ...project, account: credential.account, keyPolicy: credential.keyPolicy };
      if (expired(credential)) return { ...saved, connected: false, reason: 'key_expired' };
      try {
        const identity = await this.readIdentity(credential.token);
        if (identity.account.id !== credential.account.id) throw new Error('Portal account changed');
        if (identity.keyPolicy?.expiresAt && Date.parse(identity.keyPolicy.expiresAt) <= Date.now()) {
          return { ...project, ...identity, connected: false, reason: 'key_expired' };
        }
        return { ...project, ...identity, connected: true };
      } catch (error) {
        const reason = error instanceof PortalHttpError && error.status === 401
          ? 'key_invalid_or_revoked' : 'portal_unavailable';
        return { ...saved, connected: false, reason };
      }
    });
  }

  /** Resolve the binding and ask Portal for the observable capability of a readable target. */
  public preflight(subject: PortalOwner, operation: 'read' | 'write' | 'publish', kind: PortalItemKind,
    targetId: number, audience: 'public' | 'protected') {
    return this.exclusive(subject, async () => {
      const scope = audience === 'public' ? { mode: 'public' } : typeof subject === 'string'
        ? { mode: this.isService(subject) ? 'service' : 'personal' }
        : { mode: 'project', projectId: subject[1] };
      const result = (stage: string, code: string, nextAction: string, extra: Record<string, unknown> = {}) =>
        ({ stage, code, nextAction, scope, checkedAt: new Date().toISOString(), apiOrigin: this.#api.origin, ...extra });
      if (audience === 'public' && operation !== 'read') throw new Error('Public access is available for reading only');
      if (!Object.hasOwn(PORTAL_ITEM_TYPES, kind) || !Number.isSafeInteger(targetId) || targetId <= 0 ||
          (operation === 'publish' && kind !== 'schema')) throw new Error('Invalid Portal preflight target');
      let token: string | undefined, stage = 'account';
      let account: { id: number; username: string } | undefined, keyPolicy: PortalKeyPolicy | undefined;
      try {
        if (audience === 'protected') {
          const stored = this.boundCredential(subject);
          if (!stored && !this.isService(subject)) return this.delegated(subject)
            ? result('binding', 'PORTAL_DELEGATION_REVOKED', 'reauthorize_mcp')
            : result('binding', 'PORTAL_NOT_CONNECTED', 'connect_portal');
          if (stored && expired(stored)) return result('binding', 'PORTAL_KEY_EXPIRED', 'connect_portal');
          const credential = this.credential(subject, targetId);
          token = credential.token;
          ({ account, keyPolicy } = await this.readIdentity(token));
          if (!this.isService(subject) && account.id !== credential.account.id)
            return result(stage, 'PORTAL_ACCOUNT_CHANGED', 'connect_portal');
          if (keyPolicy && (!keyPolicy.scopes.includes('read') || (operation !== 'read' && !keyPolicy.scopes.includes('write'))))
            return result(stage, 'PORTAL_KEY_SCOPE', this.delegated(subject) ? 'reauthorize_mcp' : 'connect_portal', { account, keyPolicy });
        }
        stage = 'target';
        const target = await this.#api.getAccess(targetId, { token, anonymous: audience === 'public' });
        if (target.id !== targetId || target.item_type !== PORTAL_ITEM_TYPES[kind])
          return result(stage, 'PORTAL_NOT_FOUND', 'check_target_and_access');
        if (typeof target.can_write !== 'boolean' || typeof target.can_publish_schema !== 'boolean' ||
            typeof target.time_update !== 'string' || !Number.isFinite(Date.parse(target.time_update)))
          return result(stage, 'PORTAL_INVALID_RESPONSE', 'check_portal_api');
        const data = { target, ...(account ? { account, keyPolicy } : {}) };
        if ((operation === 'write' && !target.can_write) || (operation === 'publish' && !target.can_publish_schema))
          return result(stage, 'PORTAL_OBJECT_RESTRICTED', 'check_portal_permissions', data);
        return result(stage, 'OK', 'continue', data);
      } catch (error) {
        const failure = portalFailure(error);
        if (!failure) return result(stage, 'PORTAL_PREFLIGHT_FAILED', 'check_portal_configuration');
        return result(stage, failure.code, failure.nextAction, failure);
      }
    });
  }

  private async readIdentity(token: string) {
    const result = await this.#api.getAccount(token);
    if (!Number.isSafeInteger(result.id) || typeof result.username !== 'string')
      throw new Error('Portal returned invalid account metadata');
    const account = { id: result.id as number, username: result.username as string };
    let keyPolicy: PortalKeyPolicy | undefined;
    if (result.scopes !== undefined) {
      if (!Array.isArray(result.scopes) ||
        result.scopes.some((scope: unknown) => !isPortalKeyScope(scope) && scope !== 'publish') ||
        (result.expires_at !== null && result.expires_at !== undefined &&
          (typeof result.expires_at !== 'string' || !Number.isFinite(Date.parse(result.expires_at)))))
        throw new Error('Portal returned invalid key policy');
      keyPolicy = { scopes: result.scopes.filter(isPortalKeyScope), expiresAt: result.expires_at ?? null };
    }
    return { account, keyPolicy };
  }

  /** Search with the bound personal key, including private library items. Never guess IDs. */
  public searchLibrary(subject: PortalOwner, query: string, location?: string) {
    return this.exclusive(subject, async () => {
      const credential = this.personalCredential(subject);
      if (typeof query !== 'string' || !query.trim() || query.length > 1000)
        throw new Error('A nonempty search query of at most 1000 characters is required');
      if (location !== undefined) validateLocation(location);
      const parameters = new URLSearchParams({ q: query, ...(location ? { location, subfolders: '1' } : {}) });
      const result = await this.#api.request(credential.token, `/api/agents/library/context-search?${parameters}`);
      if (!Array.isArray(result.ids) || result.ids.some((id: unknown) => !Number.isSafeInteger(id) || Number(id) <= 0))
        throw new Error('Portal returned invalid library search results');
      return { ids: result.ids, complete: true };
    });
  }

  public getDetails(subject: PortalOwner, kind: PortalItemKind, targetId: number, anonymous = false) {
    return this.exclusive(subject, async () => {
      const credential = anonymous ? undefined : this.credential(subject, targetId);
      if (credential?.keyPolicy && !credential.keyPolicy.scopes.includes('read')) throw new Error('Portal key does not allow read');
      return this.readItem(credential, kind, targetId);
    });
  }

  /** Use the Portal revision guard and independently verify each stored interpretation. */
  public setModelValues(subject: PortalOwner, targetId: number, expectedTimeUpdate: string, values: unknown) {
    return this.exclusive(subject, async () => {
      if (typeof expectedTimeUpdate !== 'string' || !Number.isFinite(Date.parse(expectedTimeUpdate)) ||
          /[\r\n]/.test(expectedTimeUpdate)) throw new Error('A valid expectedTimeUpdate is required');
      if (!Array.isArray(values) || !values.length) throw new Error('A nonempty values array is required');
      const targets = new Set<number>();
      for (const value of values) {
        if (!value || typeof value !== 'object' || Array.isArray(value) ||
            Object.keys(value).some(key => !['target', 'type', 'data'].includes(key)))
          throw new Error('Each value accepts only target, type and data');
        const { target, type, data } = value;
        if (!Number.isSafeInteger(target) || target <= 0 || targets.has(target) ||
            typeof type !== 'string' || !type.trim() || type !== type.trim() || data === undefined)
          throw new Error('Each value needs a unique constituent ID, a canonical type and data');
        targets.add(target);
      }
      const credential = this.personalCredential(subject, 'write');
      const written = await this.#api.setModelValues(credential.token, targetId, expectedTimeUpdate, values);
      const verificationError = 'Portal model value verification failed; read the model before retrying';
      const details = await this.readItem(credential, 'model', targetId).catch(() => { throw new Error(verificationError); });
      if (written.id !== targetId || !Number.isSafeInteger(written.schema) || written.schema <= 0 ||
          written.schema !== details.schema || typeof written.time_update !== 'string' ||
          written.time_update === expectedTimeUpdate || details.time_update !== written.time_update ||
          !Array.isArray(details.items)) throw new Error(verificationError);
      const items = new Map(details.items.map(item => [item.id, item]));
      for (const { target, type, data } of values) {
        const item = items.get(target);
        if (!item || item.type !== type || !isDeepStrictEqual(item.value, data)) throw new Error(verificationError);
      }
      return { targetId, schemaId: details.schema, time_update: details.time_update, verified: true };
    });
  }

  /** Verify the persisted constituent by ID and leave inherited constituents to their sources. */
  public mutateConstituent(subject: PortalOwner, targetId: number, expectedTimeUpdate: string,
    constituentId: number | undefined, fields: Record<string, unknown>) {
    return this.exclusive(subject, async () => {
      if (typeof expectedTimeUpdate !== 'string' || !Number.isFinite(Date.parse(expectedTimeUpdate)) ||
          /[\r\n]/.test(expectedTimeUpdate)) throw new Error('A valid expectedTimeUpdate is required');
      const credential = this.credential(subject, targetId, 'write');
      if (credential.keyPolicy && !credential.keyPolicy.scopes.includes('read')) throw new Error('Portal key does not allow read');
      const before = await this.readItem(credential, 'schema', targetId);
      if (before.time_update !== expectedTimeUpdate)
        throw new Error('Portal schema changed; read the current revision before retrying');
      if (!Array.isArray(before.items) || !Array.isArray(before.inheritance)) throw new Error('Invalid Portal schema');
      const creating = constituentId === undefined;
      if (creating) {
        if (before.items.some(item => item.alias === fields.alias)) throw new Error('The constituent alias already exists');
      } else {
        const previous = before.items.find(item => item.id === constituentId);
        if (!previous) throw new Error('The constituent is not in this schema');
        if (before.inheritance.some(link => link.child === constituentId))
          throw new Error('The constituent is inherited; edit its source schema');
        if (fields.alias === previous.alias && fields.cst_type !== undefined && fields.cst_type !== previous.cst_type)
          throw new Error('A type change needs a new alias; omit alias to let Portal assign it');
      }
      const response = await this.#api.mutateConstituent(credential.token, targetId, constituentId, expectedTimeUpdate, fields);
      const written = creating ? response.schema : response;
      const writtenId = creating ? response.new_cst?.id : constituentId;
      const invalid = 'Portal constituent verification failed; read the schema before retrying';
      if (!Number.isSafeInteger(writtenId) || writtenId <= 0 || written?.id !== targetId ||
          typeof written.time_update !== 'string' || !Number.isFinite(Date.parse(written.time_update)) ||
          written.time_update === expectedTimeUpdate || !Array.isArray(written.items)) throw new Error(invalid);
      const after = await this.readItem(credential, 'schema', targetId);
      const item = Array.isArray(after.items) && after.items.find(row => row.id === writtenId);
      const expectedIds = before.items.map(row => row.id);
      if (creating) expectedIds.push(writtenId);
      const incoming = (schema: Record<string, any>) => schema.inheritance
        .filter((link: Record<string, any>) => link.child_source === targetId)
        .sort((a: Record<string, any>, b: Record<string, any>) => a.child - b.child || a.parent - b.parent);
      if (!item || after.time_update !== written.time_update || !Array.isArray(after.inheritance) ||
          !isDeepStrictEqual(after.items.map((row: Record<string, unknown>) => row.id), expectedIds) ||
          !isDeepStrictEqual(incoming(before), incoming(after)) ||
          !isDeepStrictEqual(content(after), content(written)) ||
          Object.entries(fields).some(([key, value]) => !isDeepStrictEqual(item[key], value)))
        throw new Error(invalid);
      if (creating && !isDeepStrictEqual(content(before), content({ ...after, items: after.items.slice(0, -1) })))
        throw new Error(invalid);
      return { targetId, constituentId: writtenId, time_update: after.time_update, verified: true, item };
    });
  }

  /** Guard the graph revision in Portal and verify the affected operation by an independent read. */
  public mutateOss(subject: PortalOwner, targetId: number, expectedTimeUpdate: string,
    action: PortalOssAction, payload: Record<string, unknown>) {
    return this.exclusive(subject, async () => {
      if (typeof expectedTimeUpdate !== 'string' || !Number.isFinite(Date.parse(expectedTimeUpdate)) || /[\r\n]/.test(expectedTimeUpdate))
        throw new Error('A valid expectedTimeUpdate is required');
      const createsOperation = action === 'create-schema' || action === 'import-schema' || action === 'create-synthesis';
      const requestedOperationId = payload.target;
      if (!createsOperation && (typeof requestedOperationId !== 'number' ||
        !Number.isSafeInteger(requestedOperationId) || requestedOperationId <= 0))
        throw new Error('A positive, safe integer operation ID is required');
      const credential = this.personalCredential(subject, 'write');
      const before = await this.readItem(credential, 'oss', targetId);
      if (before.time_update !== expectedTimeUpdate)
        throw new Error('Portal OSS changed; read the current revision before retrying');
      const response = await this.#api.mutateOss(credential.token, targetId, action, expectedTimeUpdate, payload);
      const written = createsOperation ? response.oss : response;
      const operationId = createsOperation ? response.new_operation : requestedOperationId;
      const verificationError = 'Portal OSS verification failed; read the graph before retrying';
      if (!Number.isSafeInteger(operationId) || Number(operationId) <= 0 || written?.id !== targetId ||
        typeof written.time_update !== 'string' || written.time_update === expectedTimeUpdate)
        throw new Error(verificationError);
      // A failed readback leaves the outcome uncertain. Never replay the mutation here.
      const oss = await this.readItem(credential, 'oss', targetId);
      const operation = Array.isArray(oss.operations) && oss.operations.find(row => row?.id === operationId);
      const writtenOperation = Array.isArray(written.operations) && written.operations.find((row: any) => row?.id === operationId);
      const expectedType = action === 'create-synthesis' || action === 'execute-operation' ? 'synthesis' : createsOperation ? 'input' : undefined;
      if (oss.time_update !== written.time_update || !operation || !isDeepStrictEqual(operation, writtenOperation) ||
        (expectedType !== undefined && operation.operation_type !== expectedType) ||
        !['arguments', 'substitutions'].every(field => Array.isArray(oss[field]) && Array.isArray(written[field]) &&
          isDeepStrictEqual(oss[field].filter(row => row?.operation === operationId),
            written[field].filter((row: any) => row?.operation === operationId))) ||
        (operation.result !== null && (!Number.isSafeInteger(operation.result) || operation.result <= 0)))
        throw new Error(verificationError);
      return { targetId, operationId, resultId: operation.result, time_update: oss.time_update, verified: true, oss };
    });
  }

  /** Create a new empty item only. Existing-content replacement retains its separate approval. */
  public createItem(subject: PortalOwner, kind: PortalItemKind, args: Record<string, unknown>, source?: RSToolAgent) {
    return this.exclusive(subject, async () => {
      const credential = this.personalCredential(subject, 'write');
      if (!this.#creations) throw new Error('Portal creation receipts are not configured');
      const allowed = ['requestId', 'title', 'alias', 'description', 'location', 'accessPolicy', ...(kind === 'model' ? ['schemaId'] : [])];
      if (Object.keys(args).some(key => !allowed.includes(key))) throw new Error('Unexpected Portal creation argument');
      if (typeof args.title !== 'string' || !args.title.trim() || typeof args.alias !== 'string' ||
          (args.description !== undefined && typeof args.description !== 'string')) throw new Error('title and alias must be strings');
      // Library creation trims CharFields, unlike the separate description CAS endpoint.
      // Reject noncanonical input before reserving a request or causing a remote side effect.
      if ([args.title, args.alias, args.description ?? ''].some(value =>
        (value as string) !== (value as string).trim() || /^[\u0085\u001c-\u001f]|[\u0085\u001c-\u001f]$/.test(value as string)))
        throw new Error('Creation title, alias and description must not start or end with whitespace');
      validateLocation(args.location);
      if (!['private', 'protected', 'public'].includes(args.accessPolicy as string)) throw new Error('An explicit accessPolicy is required');
      if (kind === 'model' && (!Number.isSafeInteger(args.schemaId) || Number(args.schemaId) <= 0))
        throw new Error('A positive schemaId is required for a model');
      const metadata = { title: args.title, alias: args.alias, description: args.description ?? '' };
      const schema = source ? { ...JSON.parse(source.exportPortal({ kind: 'schema', format: 'json' }) as string), ...metadata } : undefined;
      if (source && kind !== 'schema') throw new Error('Only schema creation accepts a source session');
      const payload = { ...metadata, ...(schema ? { schema } : {}),
        location: args.location, access_policy: args.accessPolicy, ...(kind === 'model' ? { schema: args.schemaId } : {}) };
      const digest = createHash('sha256').update(JSON.stringify({ kind, origin: this.#api.origin, accountId: credential.account.id, payload })).digest('hex');
      const requestId = args.requestId as string;
      let receipt = this.#creations.get(subject, requestId);
      if (receipt && (receipt.digest !== digest || receipt.accountId !== credential.account.id || receipt.origin !== this.#api.origin))
        throw new Error('requestId is already bound to a different creation request');
      const replay = !!receipt;
      if (!receipt) {
        const serverKey = operationKey(subject, 'creation', requestId);
        receipt = { kind, digest, origin: this.#api.origin, accountId: credential.account.id, state: 'sending', serverKey };
        this.#creations.reserve(subject, requestId, receipt);
      }
      if (!receipt.targetId && replay && receipt.serverKey) {
        receipt = await this.recoverCreation(subject, requestId, credential, receipt);
      }
      if (!receipt.targetId && receipt.serverKey && (!replay ||
          await this.#api.supportsMutationReceipts(credential.token).catch(() => false))) {
        const result = await this.#api.createItem(kind, payload, receipt.serverKey, credential.token);
        if (!Number.isSafeInteger(result.id) || result.id <= 0)
          throw new Error('Portal returned an invalid created ID; inspect library before retrying');
        receipt = { ...receipt, state: 'created', targetId: result.id, revision: result.committed_time_update ?? result.time_update };
        try { this.#creations.complete(subject, requestId, receipt); }
        catch { throw new Error(`Portal created item ${result.id}, but its receipt could not be saved; inspect Portal before retrying`); }
      }
      if (!receipt.targetId) throw new Error('Creation outcome is uncertain; search the library before using a new requestId');
      const item = await this.readItem(credential, kind, receipt.targetId);
      if (item.title !== payload.title || item.alias !== payload.alias || item.description !== payload.description ||
          item.location !== payload.location || item.access_policy !== payload.access_policy ||
          item.owner !== credential.account.id || (receipt.revision !== undefined && item.time_update !== receipt.revision) ||
          (schema && !isDeepStrictEqual(content(item), content(schema))) ||
          (kind === 'model' && item.schema !== args.schemaId))
        throw new Error(`Created item ${receipt.targetId} verification failed; inspect Portal, do not create another item`);
      return { requestId, kind, portalOrigin: this.#api.origin, targetId: receipt.targetId, verified: true, item };
    });
  }

  private async recoverCreation(subject: PortalOwner, requestId: string, credential: PortalCredential,
    receipt: NonNullable<ReturnType<PortalCreations['get']>>) {
    if (!receipt.serverKey || !this.#creations) return receipt;
    try {
      const committed = await this.#api.getReceipt(PORTAL_CREATE_OPERATIONS[receipt.kind], receipt.serverKey, credential.token);
      if (!Number.isSafeInteger(committed.target_id) || committed.target_id <= 0 || typeof committed.revision !== 'string' ||
          !Number.isFinite(Date.parse(committed.revision))) throw new Error('Invalid Portal creation receipt');
      const resolved = { ...receipt, state: 'created' as const, targetId: committed.target_id, revision: committed.revision };
      this.#creations.complete(subject, requestId, resolved);
      return resolved;
    } catch (error) {
      if (error instanceof PortalHttpError && error.status === 404) return receipt;
      throw error;
    }
  }

  /** Read a durable receipt after restart or a lost response; never sends a mutation. */
  public creationStatus(subject: PortalOwner, requestId: string) {
    return this.exclusive(subject, async () => {
      const credential = this.personalCredential(subject);
      if (!this.#creations) throw new Error('Portal creation receipts are not configured');
      let receipt = this.#creations.get(subject, requestId);
      if (!receipt || receipt.accountId !== credential.account.id) return { requestId, state: 'not_found' };
      if (receipt.origin !== this.#api.origin) throw new Error('Creation receipt belongs to a different Portal origin; check host configuration');
      if (typeof subject !== 'string') {
        const identity = await this.readIdentity(credential.token);
        if (identity.account.id !== receipt.accountId) return { requestId, state: 'not_found' };
        if (identity.keyPolicy && !identity.keyPolicy.scopes.includes('read')) throw new Error('Portal key does not allow read');
      }
      if (receipt.state === 'sending' && receipt.serverKey) receipt = await this.recoverCreation(subject, requestId, credential, receipt);
      const item = receipt.targetId ? await this.readItem(credential, receipt.kind, receipt.targetId) : undefined;
      return { requestId, kind: receipt.kind, state: receipt.state === 'sending' ? 'uncertain' : 'created',
        portalOrigin: this.#api.origin,
        ...(item ? { targetId: receipt.targetId, committedTimeUpdate: receipt.revision, currentTimeUpdate: item.time_update,
          verifiedRevision: receipt.revision !== undefined && receipt.revision === item.time_update,
          target: { owner: item.owner, location: item.location, accessPolicy: item.access_policy } } : {}) };
    });
  }

  private personalCredential(subject: PortalOwner, scope?: 'write'): PortalCredential {
    if (this.isService(subject)) throw new Error('This operation requires a personal Portal connection');
    const credential = this.credential(subject, 0, scope);
    if (credential.keyPolicy && !credential.keyPolicy.scopes.includes('read')) throw new Error('Portal key does not allow read');
    return credential;
  }

  private async readItem(credential: PortalCredential | undefined, kind: PortalItemKind, targetId: number): Promise<Record<string, any>> {
    if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal item ID is required');
    const item = await this.#api.getDetails(kind, targetId, { token: credential?.token, anonymous: !credential });
    if (item.id !== targetId) throw new Error('Portal returned an unexpected item');
    return item;
  }

  /** Public reads need no Portal key. A bound key can also authorize private data. */
  public getDescription(subject: PortalOwner, targetId: number) {
    return this.exclusive(subject, async () => {
      if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal schema ID is required');
      const credential = this.isService(subject)
        ? (this.#service!.targetIds.includes(targetId) ? this.credential(subject, targetId) : undefined)
        : this.boundCredential(subject) ?? undefined;
      const path = `/api/agents/rsforms/${targetId}/details`;
      const mayRead = credential && !expired(credential) && (!credential.keyPolicy || credential.keyPolicy.scopes.includes('read'));
      const schema = typeof subject !== 'string' && credential
        ? await this.readProjectDescription(credential, path)
        : await this.#api.request(mayRead ? credential.token : undefined, path);
      if (schema.id !== targetId || typeof schema.description !== 'string' ||
        typeof schema.time_update !== 'string' || !Number.isFinite(Date.parse(schema.time_update)))
        throw new Error('Portal returned invalid schema metadata');
      return { targetId, description: schema.description, time_update: schema.time_update };
    });
  }

  /** Public descriptions remain readable when a project's key cannot authorize private reads. */
  private async readProjectDescription(credential: PortalCredential, path: string) {
    let refusal: Error;
    if (expired(credential)) refusal = new Error('Portal key expired; reconnect on the account page');
    else if (credential.keyPolicy && !credential.keyPolicy.scopes.includes('read')) refusal = new Error('Portal key does not allow read');
    else {
      try { return await this.#api.request(credential.token, path); }
      catch (error) {
        if (!(error instanceof PortalHttpError) || error.status !== 401) throw error;
        refusal = error;
      }
    }
    try { return await this.#api.request(undefined, path); }
    catch (error) {
      if (error instanceof PortalHttpError && [401, 403, 404].includes(error.status)) throw refusal;
      throw error;
    }
  }

  /** Narrow CAS edit using the bound credential; never imports or replaces a schema. */
  public updateDescription(subject: PortalOwner, targetId: number, expectedTimeUpdate: string, description: string) {
    return this.exclusive(subject, async () => {
      if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal schema ID is required');
      if (typeof expectedTimeUpdate !== 'string' || !Number.isFinite(Date.parse(expectedTimeUpdate)))
        throw new Error('A valid expectedTimeUpdate is required');
      if (typeof description !== 'string' || [...description].length > 100000)
        throw new Error('description must be a string of at most 100000 characters');
      const credential = this.credential(subject, targetId, 'write');
      const path = `/api/agents/rsforms/${targetId}`;
      const before = await this.#api.request(credential.token, `${path}/details`);
      if (before.id !== targetId || before.time_update !== expectedTimeUpdate)
        throw new Error('Portal schema changed; read the current revision before retrying');
      content(before);
      await this.#api.request(credential.token, `${path}/description`, {
        expected_time_update: expectedTimeUpdate, description,
      });
      // A readback failure has an uncertain outcome. Never retry the write automatically.
      const after = await this.#api.request(credential.token, `${path}/details`);
      if (after.id !== targetId || after.description !== description ||
        typeof after.time_update !== 'string' || !Number.isFinite(Date.parse(after.time_update)) ||
        after.time_update === expectedTimeUpdate ||
        JSON.stringify(content({ ...after, description: before.description })) !== JSON.stringify(content(before)))
        throw new Error('Description verification failed; inspect Portal before retrying');
      return { targetId, description, time_update: after.time_update };
    });
  }

  /**
   * Replace targetId with the current session in this call.
   * Chat permission is an agent instruction, not an argument or a second page.
   */
  public publishSchema(subject: PortalOwner, targetId: number, tool: RSToolAgent,
    validateSource?: (sessionId: string) => void) {
    return this.exclusive(subject, async () => {
      if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal schema ID is required');
      const current = tool.getCurrentSession();
      if (!current) throw new RSToolError('NO_CURRENT_SESSION',
        'No current session. Call ensure_session / ensureSession or create_session / createSession before this operation.');
      const sourceId = current.sessionId;
      const credential = this.credential(subject, targetId, 'write');
      const after = JSON.parse(tool.exportPortal({ kind: 'schema', format: 'json' }) as string);
      const before = await this.#api.request(credential.token, `/api/agents/rsforms/${targetId}/details`);
      if (
        before.id !== targetId ||
        typeof before.time_update !== 'string' ||
        !Number.isFinite(Date.parse(before.time_update)) ||
        !Array.isArray(before.items)
      )
        throw new Error('Portal returned invalid schema metadata');
      validateSource?.(sourceId);
      const summary = changes(before, after);
      let result: Record<string, any>;
      try {
        result = await this.#api.request(credential.token, `/api/agents/rsforms/${targetId}/publish`, {
          expected_time_update: before.time_update,
          schema: after,
        });
      } catch (error) {
        if (isPublicationRefusal(error)) throw error;
        throw new Error('Publication result is uncertain; inspect Portal before retrying');
      }
      if (!Number.isSafeInteger(result.version) || result.version <= 0)
        throw new Error('Publication result is uncertain; inspect Portal before retrying');
      let verified: Record<string, any>;
      try {
        verified = await this.#api.request(credential.token, `/api/agents/rsforms/${targetId}/details`);
      } catch {
        throw new Error('Publication result is uncertain; inspect Portal before retrying');
      }
      if (
        verified.id !== targetId ||
        JSON.stringify(content(verified)) !== JSON.stringify(content(result.schema)) ||
        JSON.stringify(content(verified)) !== JSON.stringify(content(after))
      )
        throw new Error('Publication verification failed; inspect Portal before retrying');
      return {
        targetId,
        version: result.version,
        time_update: verified.time_update,
        beforeCount: before.items.length,
        afterCount: after.items.length,
        changes: summary,
        verified: true,
      };
    });
  }

  /** Capture immutable before/after JSON. This method never writes to Portal. */
  public prepare(subject: PortalOwner, workspace: string, targetId: number, tool: RSToolAgent,
    validateSource?: (sessionId: string) => void) {
    const ownerKey = JSON.stringify(subject);
    const preparation = { subject: ownerKey, workspace, invalidated: false };
    this.#preparations.add(preparation);
    return this.exclusive(subject, async () => {
      if (preparation.invalidated) throw new Error('Workspace was closed');
      if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal schema ID is required');
      this.expire();
      const credential = this.credential(subject, targetId, 'write');
      const sourceId = tool.getCurrentSession()?.sessionId;
      if (!sourceId) throw new RSToolError('NO_CURRENT_SESSION', 'No current session. Select the source session before preparing publication.');
      const session = tool.exportSession();
      const after = JSON.parse(tool.exportPortal({ kind: 'schema', format: 'json' }) as string);
      const before = await this.#api.request(credential.token, `/api/agents/rsforms/${targetId}/details`);
      if (
        before.id !== targetId ||
        typeof before.time_update !== 'string' ||
        !Number.isFinite(Date.parse(before.time_update)) ||
        !Array.isArray(before.items)
      )
        throw new Error('Portal returned invalid schema metadata');
      validateSource?.(sourceId);
      // One proposal per live workspace; bounded storage for all subjects.
      if (preparation.invalidated) throw new Error('Workspace was closed');
      this.clearWorkspaceDrafts(subject, workspace);
      if (session !== tool.exportSession()) throw new Error('Local schema changed; prepare publication again');
      const bytes = Buffer.byteLength(JSON.stringify({ before, after })) + Buffer.byteLength(session);
      const occupied = [...this.#drafts.values()].reduce(
        (size, draft) => size + Buffer.byteLength(JSON.stringify({ before: draft.before, after: draft.after })) + Buffer.byteLength(draft.session),
        0
      );
      if (this.#drafts.size >= 32 || bytes + occupied > 16 * 1024 * 1024)
        throw new Error('Publication capacity reached');
      const id = randomUUID();
      const sourceDigest = createHash('sha256').update(session).digest('hex');
      const digest = createHash('sha256').update(JSON.stringify({ targetId, sourceId, sourceDigest, before, after })).digest('hex');
      const draft: PreparedPublication = {
        id,
        subject: ownerKey,
        workspace,
        targetId,
        generation: credential.generation,
        expiresAt: Date.now() + 10 * 60_000,
        digest,
        session,
        sourceId,
        tool,
        validateSource: validateSource ? () => validateSource(sourceId) : undefined,
        before,
        after,
        state: 'prepared',
      };
      this.#drafts.set(id, draft);
      const summary = changes(before, after);
      return {
        publicationId: id,
        digest,
        targetId,
        expectedTimeUpdate: before.time_update,
        sourceSessionId: sourceId,
        sourceDigest,
        target: { title: before.title, alias: before.alias, owner: before.owner,
          location: before.location, accessPolicy: before.access_policy },
        proposed: { title: after.title, alias: after.alias,
          ...(summary.metadataChanged.includes('description') ? { description: previewDescription(after.description) } : {}) },
        expiresAt: new Date(draft.expiresAt).toISOString(),
        beforeCount: before.items.length,
        afterCount: after.items.length,
        changes: summary,
        confirmationPage: typeof subject === 'string' ? '/portal/account'
          : `/portal/account?project=${encodeURIComponent(subject[1])}`,
      };
    }).finally(() => this.#preparations.delete(preparation));
  }

  /** The caller supplies the prepared reference after the user accepts its summary. */
  public publishPrepared(subject: PortalOwner, workspace: string, id: string, digest: string) {
    return this.exclusive(subject, async () => {
      const draft = this.#drafts.get(id);
      if (!draft || draft.subject !== JSON.stringify(subject) || draft.workspace !== workspace || draft.digest !== digest)
        throw new Error('Publication not found in this workspace');
      const credential = this.credential(subject, draft.targetId, 'write');
      if (credential.generation !== draft.generation) throw new Error('Portal connection changed; prepare publication again');
      if (draft.state === 'published') return draft.result;
      if (draft.state === 'uncertain') {
        const recovered = await this.readPublicationReceipt(subject, id, credential);
        if (recovered) return this.verifyPrepared(draft, recovered.receipt.version_id, recovered.item, recovered.receipt.revision);
      }
      if (draft.state === 'failed' || draft.state === 'sending') throw new Error('Prepare and agree to a new publication');
      if (draft.expiresAt <= Date.now()) throw new Error('Publication expired; prepare publication again');
      if (!await this.#api.supportsMutationReceipts(credential.token)) throw new Error('Portal publication receipts are unavailable');
      draft.validateSource?.();
      if (draft.tool.getCurrentSession()?.sessionId !== draft.sourceId || draft.session !== draft.tool.exportSession())
        throw new Error('Local schema changed; prepare publication again');
      const { owner, location, access_policy } = draft.before;
      if ((owner !== null && !Number.isSafeInteger(owner)) || typeof location !== 'string' || typeof access_policy !== 'string')
        throw new Error('Portal did not return target metadata; prepare publication again');
      draft.state = 'sending';
      let accepted = false;
      try {
        const result = await this.#api.publishSchema(draft.targetId, draft.before.time_update, draft.after,
          operationKey(subject, 'publication', id), credential.token, { owner, location, access_policy });
        accepted = true;
        const verified = await this.readItem(credential, 'schema', draft.targetId);
        return this.verifyPrepared(draft, result.version, verified, result.committed_time_update);
      } catch (error) {
        draft.state = !accepted && error instanceof PortalHttpError && [400, 403, 404, 409].includes(error.status) ? 'failed' : 'uncertain';
        throw error;
      }
    });
  }

  /** Project-scoped recovery remains available after closing a chat or restarting the adapter. */
  public publicationStatus(subject: PortalOwner, id: string) {
    return this.exclusive(subject, async () => {
      if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id)) throw new Error('Invalid publicationId');
      const draft = this.#drafts.get(id);
      const targetId = draft?.subject === JSON.stringify(subject) ? draft.targetId : 0;
      const credential = this.credential(subject, targetId);
      const recovered = await this.readPublicationReceipt(subject, id, credential);
      if (!recovered) return { publicationId: id, state: 'not_found' };
      const { receipt, item } = recovered;
      const metadata = { owner: item.owner, location: item.location, access_policy: item.access_policy };
      return { publicationId: id, state: 'published', targetId: receipt.target_id, version: receipt.version_id,
        committedTimeUpdate: receipt.revision, currentTimeUpdate: item.time_update,
        verified: item.time_update === receipt.revision && isDeepStrictEqual(metadata, receipt.target_metadata),
        target: { owner: item.owner, location: item.location, accessPolicy: item.access_policy } };
    });
  }

  private async readPublicationReceipt(subject: PortalOwner, id: string, credential: PortalCredential) {
    let receipt;
    try {
      receipt = await this.#api.getReceipt('rsform.publish', operationKey(subject, 'publication', id), credential.token);
    } catch (error) {
      if (error instanceof PortalHttpError && error.status === 404) return null;
      throw error;
    }
    if (!Number.isSafeInteger(receipt.version_id) || !Number.isSafeInteger(receipt.target_id) ||
        typeof receipt.revision !== 'string' || !Number.isFinite(Date.parse(receipt.revision)))
      throw new Error('Invalid Portal publication receipt');
    return { receipt, item: await this.readItem(credential, 'schema', receipt.target_id) };
  }

  private verifyPrepared(draft: PreparedPublication, version: number | null, item: Record<string, any>, revision: string) {
    if (!Number.isSafeInteger(version) || Number(version) <= 0 || item.id !== draft.targetId ||
        typeof revision !== 'string' || revision === draft.before.time_update || item.time_update !== revision ||
        ['owner', 'location', 'access_policy'].some(field => item[field] !== draft.before[field]) ||
        !isDeepStrictEqual(content(item), content(draft.after)))
      throw new Error('Publication verification failed; inspect the receipt and current Portal schema');
    const result = { publicationId: draft.id, targetId: draft.targetId, version, time_update: revision, verified: true };
    draft.result = result;
    draft.state = 'published';
    return result;
  }

  /** The authenticated account page can inspect only this subject's proposals. */
  public publications(subject: PortalOwner) {
    this.expire();
    const ownerKey = JSON.stringify(subject);
    return structuredClone(
      [...this.#drafts.values()]
        .filter((draft) => draft.subject === ownerKey)
        .map((draft) => ({
          id: draft.id,
          targetId: draft.targetId,
          digest: draft.digest,
          expiresAt: new Date(draft.expiresAt).toISOString(),
          state: draft.state,
          apiOrigin: this.#api.origin,
          changes: changes(draft.before, draft.after),
          before: draft.before,
          after: draft.after,
          result: draft.result,
        }))
    );
  }

  /** Only the out-of-band account route calls this method, never an MCP tool. */
  public approve(subject: PortalOwner, id: string, digest: string) {
    return this.exclusive(subject, async () => {
      const draft = this.#drafts.get(id);
      if (!draft || draft.subject !== JSON.stringify(subject)) throw new Error('Publication not found');
      if (draft.state !== 'prepared')
        throw new Error('Publication already attempted; inspect Portal before preparing again');
      if (draft.expiresAt <= Date.now()) throw new Error('Publication expired');
      draft.validateSource?.();
      if (digest !== draft.digest || draft.session !== draft.tool.exportSession())
        throw new Error('Local schema changed; prepare publication again');
      const credential = this.credential(subject, draft.targetId, 'write');
      if (credential.generation !== draft.generation)
        throw new Error('Portal connection changed; prepare publication again');
      draft.validateSource?.();
      draft.state = 'sending';
      let accepted = false;
      try {
        const result = await this.#api.request(credential.token, `/api/agents/rsforms/${draft.targetId}/publish`, {
          expected_time_update: draft.before.time_update,
          schema: draft.after,
        });
        accepted = true;
        if (!Number.isSafeInteger(result.version) || result.version <= 0)
          throw new Error('Publication version was not returned');
        // Read back separately. A failed verification is uncertain, never auto-retried.
        const verified = await this.#api.request(credential.token, `/api/agents/rsforms/${draft.targetId}/details`);
        if (
          verified.id !== draft.targetId ||
          JSON.stringify(content(verified)) !== JSON.stringify(content(result.schema)) ||
          JSON.stringify(content(verified)) !== JSON.stringify(content(draft.after))
        )
          throw new Error('Publication verification failed');
        draft.result = { version: result.version, targetId: draft.targetId, time_update: verified.time_update };
        draft.state = 'published';
        return draft.result;
      } catch (error) {
        draft.state = typeof subject !== 'string' && !accepted && isPublicationRefusal(error) ? 'failed' : 'uncertain';
        throw error;
      }
    });
  }

  /** Closing a workspace invalidates proposals tied to its cached rstool instance. */
  public invalidateWorkspace(subject: PortalOwner, workspace: string): void {
    const ownerKey = JSON.stringify(subject);
    for (const preparation of this.#preparations)
      if (preparation.subject === ownerKey && preparation.workspace === workspace) preparation.invalidated = true;
    this.clearWorkspaceDrafts(subject, workspace);
  }

  /** Replace only the authenticated owner's proposal, without cancelling its current preparation. */
  private clearWorkspaceDrafts(subject: PortalOwner, workspace: string): void {
    const ownerKey = JSON.stringify(subject);
    for (const [id, draft] of this.#drafts)
      if (draft.subject === ownerKey && draft.workspace === workspace && draft.state !== 'sending')
        this.#drafts.delete(id);
  }

  private isService(subject: PortalOwner): boolean {
    return typeof subject === 'string' && (this.#service?.subjects.includes(subject) ?? false);
  }

  /** Personal subjects never fall back to a service grant; service targets are explicitly restricted. */
  private credential(subject: PortalOwner, targetId: number, requiredScope?: 'write'): PortalCredential {
    if (this.isService(subject)) {
      if (!this.#service!.targetIds.includes(targetId)) throw new Error('Service publication target is not allowed');
      return { token: this.#service!.token, generation: 'service', account: { id: 0, username: 'service' } };
    }
    const credential = this.boundCredential(subject);
    if (!credential && this.delegated(subject)) throw new Error('Portal delegation was revoked; reauthorize the MCP connection');
    if (!credential) throw new Error(typeof subject === 'string' ? 'Connect a personal Portal key on the account page'
      : 'Connect this project to Portal using portal_connection_status and the account page');
    if (expired(credential)) throw new Error('Portal key expired; reconnect on the account page');
    if (requiredScope && credential.keyPolicy && !credential.keyPolicy.scopes.includes(requiredScope))
      throw new Error('Portal key does not allow ' + requiredScope);
    if (requiredScope && credential.keyPolicy && !credential.keyPolicy.scopes.includes('read'))
      throw new Error('Portal key does not allow read, which is required to verify the target before mutation');
    return credential;
  }

  /** Credential replacement/disconnect removes every pending approval owned by this subject. */
  private invalidateSubject(subject: PortalOwner): void {
    const ownerKey = JSON.stringify(subject);
    for (const [id, draft] of this.#drafts) if (draft.subject === ownerKey) this.#drafts.delete(id);
  }

  /** Expire idle proposals without dropping an operation whose remote result is still pending. */
  private expire(): void {
    for (const [id, draft] of this.#drafts)
      if (draft.expiresAt <= Date.now() && draft.state !== 'sending') this.#drafts.delete(id);
  }

  /** Serialize credential changes with publication, with bounded global/per-subject queues. */
  private exclusive<T>(subject: PortalOwner, operation: () => Promise<T>): Promise<T> {
    if (typeof subject !== 'string' && this.isService(subject[0])) {
      return Promise.reject(new Error('This identity has an administrator-managed service credential and cannot use a project connection'));
    }
    const ownerKey = JSON.stringify(subject);
    if (this.#pending >= 64 || (this.#counts.get(ownerKey) ?? 0) >= 8)
      return Promise.reject(new Error('Portal queue is full'));
    this.#pending++;
    this.#counts.set(ownerKey, (this.#counts.get(ownerKey) ?? 0) + 1);
    const result = (this.#tails.get(ownerKey) ?? Promise.resolve()).then(operation);
    const settled = result.then(
      () => undefined,
      () => undefined
    );
    this.#tails.set(ownerKey, settled);
    void settled.then(() => {
      this.#pending--;
      const count = this.#counts.get(ownerKey)! - 1;
      if (count) this.#counts.set(ownerKey, count);
      else this.#counts.delete(ownerKey);
      if (this.#tails.get(ownerKey) === settled) this.#tails.delete(ownerKey);
    });
    return result;
  }
}

function previewDescription(value: string) {
  if (value.length <= 360) return { text: value, truncated: false };
  return { text: value.slice(0, 360), truncated: true, length: value.length,
    digest: createHash('sha256').update(value).digest('hex') };
}

function isPublicationRefusal(error: unknown): boolean {
  return error instanceof PortalHttpError && [401, 403, 409].includes(error.status);
}

function operationKey(subject: PortalOwner, action: 'creation' | 'publication', id: string): string {
  return createHash('sha256').update(JSON.stringify([subject, action, id])).digest('hex');
}

function validateLocation(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value !== value.trim() || /\u0085$/.test(value) ||
      !/^\/[USPL](?:\/[^/\\\x00-\x1f]+)*$/.test(value))
    throw new Error('An explicit Portal location such as /U/Project without outer whitespace is required');
}

/** Compare the material returned by two Portal reads, excluding transport metadata. */
function content(schema: Record<string, any>) {
  if (!schema || !Array.isArray(schema.items)) throw new Error('Invalid Portal schema');
  const aliases = new Map(schema.items.map((item: Record<string, any>) => [item.id, item.alias]));
  const fields = [
    'alias',
    'cst_type',
    'convention',
    'crucial',
    'definition_formal',
    'definition_raw',
    'term_raw',
    'term_forms',
    'typification_manual',
    'value_is_property',
  ];
  return {
    title: schema.title ?? '',
    alias: schema.alias ?? '',
    description: schema.description ?? '',
    items: schema.items.map((item: Record<string, any>) =>
      Object.fromEntries(
        fields.map((field) => [
          field,
          item[field] ?? (['crucial', 'value_is_property'].includes(field) ? false : field === 'term_forms' ? [] : ''),
        ])
      )
    ),
    attribution: (schema.attribution ?? [])
      .map((entry: { container: number; attribute: number }) => ({
        container: aliases.get(entry.container),
        attribute: aliases.get(entry.attribute),
      }))
      .sort((left: unknown, right: unknown) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
  };
}

/** Compare persisted constituent fields rather than IDs or parser-derived Portal fields. */
function changes(before: Record<string, any>, after: Record<string, any>) {
  const oldItems = new Map(
    content(before).items.map((item: Record<string, unknown>) => [item.alias, JSON.stringify(item)])
  );
  const newItems = new Map(
    content(after).items.map((item: Record<string, unknown>) => [item.alias, JSON.stringify(item)])
  );
  const oldAttribution = new Map(content(before).attribution.map((edge: unknown) => [JSON.stringify(edge), edge]));
  const newAttribution = new Map(content(after).attribution.map((edge: unknown) => [JSON.stringify(edge), edge]));
  return {
    attributionAdded: [...newAttribution].filter(([key]) => !oldAttribution.has(key)).map(([, edge]) => edge),
    attributionRemoved: [...oldAttribution].filter(([key]) => !newAttribution.has(key)).map(([, edge]) => edge),
    added: [...newItems.keys()].filter((alias) => !oldItems.has(alias)),
    removed: [...oldItems.keys()].filter((alias) => !newItems.has(alias)),
    changed: [...newItems.keys()].filter((alias) => oldItems.has(alias) && oldItems.get(alias) !== newItems.get(alias)),
    metadataChanged: ['title', 'alias', 'description'].filter(
      (field) => (before[field] ?? '') !== (after[field] ?? '')
    ),
  };
}

/** Key policy is only an early hint; Portal enforces current scopes and expiration on each request. */
function expired(credential: PortalCredential): boolean {
  return !!credential.keyPolicy?.expiresAt && Date.parse(credential.keyPolicy.expiresAt) <= Date.now();
}
