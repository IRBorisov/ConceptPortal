import { createHash, randomUUID } from 'node:crypto';

import type { RSToolAgent } from '@rsconcept/rstool';

import { PortalClient } from './portal-client';
import { PortalCreations, type PortalItemKind } from './portal-creations';
import { PortalVault, type PortalCredential, type PortalKeyPolicy } from './portal-vault';
import { reviewSourceDiagnostics, type SourceDiagnosticReview } from './source-diagnostics';

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
  tool: RSToolAgent;
  validateSource?: () => void;
  before: Record<string, any>;
  after: Record<string, any>;
  sourceReview?: SourceDiagnosticReview;
  state: 'prepared' | 'sending' | 'published' | 'uncertain' | 'failed';
  result?: unknown;
}

/** Own the external publication lifecycle; RS validation and editing stay in rstool. */
export class PortalPublisher {
  readonly #vault: PortalVault;
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

  /** Bind an entered key to the authenticated subject after verifying its Portal account. */
  public connect(subject: string, token: string) {
    return this.exclusive(subject, async () => {
      if (this.isService(subject)) throw new Error('This identity has an administrator-managed service credential');
      if (typeof token !== 'string' || !/^rcp_[A-Za-z0-9_-]{20,200}$/.test(token))
        throw new Error('Invalid Portal key');
      const account = await this.#api.request(token, '/api/agents/me');
      if (!Number.isSafeInteger(account.id) || typeof account.username !== 'string')
        throw new Error('Portal returned invalid account metadata');
      let keyPolicy: PortalKeyPolicy | undefined;
      if (account.scopes !== undefined) {
        if (!Array.isArray(account.scopes) || !account.scopes.length ||
          account.scopes.some((scope: unknown) => !['read', 'write', 'publish'].includes(scope as string)) ||
          (account.expires_at !== null && account.expires_at !== undefined &&
            (typeof account.expires_at !== 'string' || !Number.isFinite(Date.parse(account.expires_at)))))
          throw new Error('Portal returned invalid key policy');
        keyPolicy = { scopes: account.scopes, expiresAt: account.expires_at ?? null };
        if (keyPolicy.expiresAt && Date.parse(keyPolicy.expiresAt) <= Date.now()) throw new Error('Portal key expired');
      }
      this.#vault.set(subject, token, { id: account.id, username: account.username }, keyPolicy);
      this.invalidateSubject(subject);
      return this.connection(subject);
    });
  }

  /** Disconnect locally; revocation of the original key is done in the Portal profile. */
  public disconnect(subject: string) {
    return this.exclusive(subject, async () => {
      if (this.isService(subject)) throw new Error('Service credentials are managed by the administrator');
      this.#vault.remove(subject);
      this.invalidateSubject(subject);
      return { connected: false };
    });
  }

  /** Safe status only: no secret, encrypted value, or credential-file location. */
  public connection(subject: string) {
    if (this.isService(subject)) return { connected: true, mode: 'service' };
    const credential = this.#vault.get(subject);
    return credential
      ? { connected: !expired(credential), mode: 'personal', account: credential.account,
          ...(credential.keyPolicy ? { keyPolicy: credential.keyPolicy, expired: expired(credential) } : {}) }
      : { connected: false, mode: 'personal' };
  }

  /** Search with the bound personal key, including private library items. Never guess IDs. */
  public searchLibrary(subject: string, query: string, location?: string) {
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

  public getDetails(subject: string, kind: PortalItemKind, targetId: number) {
    return this.exclusive(subject, async () => {
      const credential = this.credential(subject, targetId);
      if (credential.keyPolicy && !credential.keyPolicy.scopes.includes('read')) throw new Error('Portal key does not allow read');
      return this.readItem(credential, kind, targetId);
    });
  }

  /** Create a new empty item only. Existing-content replacement retains its separate approval. */
  public createItem(subject: string, kind: PortalItemKind, args: Record<string, unknown>) {
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
      const payload = { title: args.title, alias: args.alias, description: args.description ?? '',
        location: args.location, access_policy: args.accessPolicy, ...(kind === 'model' ? { schema: args.schemaId } : {}) };
      const digest = createHash('sha256').update(JSON.stringify({ kind, origin: this.#api.origin, accountId: credential.account.id, payload })).digest('hex');
      const requestId = args.requestId as string;
      let receipt = this.#creations.get(subject, requestId);
      if (receipt && (receipt.digest !== digest || receipt.accountId !== credential.account.id || receipt.origin !== this.#api.origin))
        throw new Error('requestId is already bound to a different creation request');
      if (!receipt) {
        receipt = { kind, digest, origin: this.#api.origin, accountId: credential.account.id, state: 'sending' };
        this.#creations.reserve(subject, requestId, receipt);
        // A failure after reservation is uncertain. Neither this method nor a retry sends another POST.
        const result = await this.#api.request(credential.token, `/api/agents/${itemRoute(kind)}`, payload);
        if (!Number.isSafeInteger(result.id) || result.id <= 0)
          throw new Error('Portal returned an invalid created ID; inspect library before retrying');
        receipt = { ...receipt, state: 'created', targetId: result.id };
        try { this.#creations.complete(subject, requestId, receipt); }
        catch { throw new Error(`Portal created item ${result.id}, but its receipt could not be saved; inspect Portal before retrying`); }
      }
      if (!receipt.targetId) throw new Error('Creation outcome is uncertain; search the library before using a new requestId');
      const item = await this.readItem(credential, kind, receipt.targetId);
      if (item.title !== payload.title || item.alias !== payload.alias || item.description !== payload.description ||
          item.location !== payload.location || item.access_policy !== payload.access_policy ||
          (kind === 'model' && item.schema !== args.schemaId))
        throw new Error(`Created item ${receipt.targetId} verification failed; inspect Portal, do not create another item`);
      return { requestId, kind, portalOrigin: this.#api.origin, targetId: receipt.targetId, verified: true, item };
    });
  }

  /** Read a durable receipt after restart or a lost response; never replays creation. */
  public creationStatus(subject: string, requestId: string) {
    return this.exclusive(subject, async () => {
      const credential = this.personalCredential(subject);
      if (!this.#creations) throw new Error('Portal creation receipts are not configured');
      const receipt = this.#creations.get(subject, requestId);
      if (!receipt || receipt.accountId !== credential.account.id) return { requestId, state: 'not_found' };
      if (receipt.origin !== this.#api.origin) throw new Error('Creation receipt belongs to a different Portal origin; check host configuration');
      return { requestId, kind: receipt.kind, state: receipt.state === 'sending' ? 'uncertain' : 'created',
        portalOrigin: this.#api.origin,
        ...(receipt.targetId ? { targetId: receipt.targetId } : {}) };
    });
  }

  private personalCredential(subject: string, scope?: 'write'): PortalCredential {
    if (this.isService(subject)) throw new Error('Creating or searching library items requires a personal Portal connection');
    const credential = this.credential(subject, 0, scope);
    if (credential.keyPolicy && !credential.keyPolicy.scopes.includes('read')) throw new Error('Portal key does not allow read');
    return credential;
  }

  private async readItem(credential: PortalCredential, kind: PortalItemKind, targetId: number) {
    if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal item ID is required');
    const item = await this.#api.request(credential.token, `/api/agents/${itemRoute(kind)}/${targetId}/details`);
    if (item.id !== targetId) throw new Error('Portal returned an unexpected item');
    return item;
  }

  /** Public reads need no Portal key. A bound key can also authorize private data. */
  public getDescription(subject: string, targetId: number) {
    return this.exclusive(subject, async () => {
      if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal schema ID is required');
      const credential = this.isService(subject)
        ? (this.#service!.targetIds.includes(targetId) ? this.credential(subject, targetId) : undefined)
        : this.#vault.get(subject) ?? undefined;
      const mayRead = credential && !expired(credential) && (!credential.keyPolicy || credential.keyPolicy.scopes.includes('read'));
      const schema = await this.#api.request(mayRead ? credential.token : undefined, `/api/agents/rsforms/${targetId}/details`);
      if (schema.id !== targetId || typeof schema.description !== 'string' ||
        typeof schema.time_update !== 'string' || !Number.isFinite(Date.parse(schema.time_update)))
        throw new Error('Portal returned invalid schema metadata');
      return { targetId, description: schema.description, time_update: schema.time_update };
    });
  }

  /** Narrow CAS edit using the bound credential; never imports or replaces a schema. */
  public updateDescription(subject: string, targetId: number, expectedTimeUpdate: string, description: string) {
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

  /** Capture immutable before/after JSON. This method never writes to Portal. */
  public prepare(subject: string, workspace: string, targetId: number, tool: RSToolAgent,
    validateSource?: (sessionId: string) => void, sourceDiagnostics?: unknown) {
    const preparation = { subject, workspace, invalidated: false };
    this.#preparations.add(preparation);
    return this.exclusive(subject, async () => {
      if (preparation.invalidated) throw new Error('Workspace was closed');
      if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal schema ID is required');
      this.expire();
      const credential = this.credential(subject, targetId, 'publish');
      const sourceId = tool.getCurrentSession()!.sessionId;
      const session = tool.exportSession();
      const after = JSON.parse(tool.exportPortal({ kind: 'schema', format: 'json' }) as string);
      const sourceReview = reviewSourceDiagnostics(sourceDiagnostics, tool.listDiagnostics(), after);
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
      const bytes = Buffer.byteLength(JSON.stringify({ before, after, sourceReview }));
      const occupied = [...this.#drafts.values()].reduce(
        (size, draft) => size + Buffer.byteLength(JSON.stringify({ before: draft.before, after: draft.after, sourceReview: draft.sourceReview })),
        0
      );
      if (this.#drafts.size >= 32 || bytes + occupied > 16 * 1024 * 1024)
        throw new Error('Publication capacity reached');
      const id = randomUUID();
      const digest = createHash('sha256').update(JSON.stringify({ targetId, before, after, sourceReview })).digest('hex');
      const draft: PreparedPublication = {
        id,
        subject,
        workspace,
        targetId,
        generation: credential.generation,
        expiresAt: Date.now() + 10 * 60_000,
        digest,
        session,
        tool,
        validateSource: validateSource ? () => validateSource(sourceId) : undefined,
        before,
        after,
        sourceReview,
        state: 'prepared',
      };
      this.#drafts.set(id, draft);
      return {
        publicationId: id,
        digest,
        targetId,
        expiresAt: new Date(draft.expiresAt).toISOString(),
        beforeCount: before.items.length,
        afterCount: after.items.length,
        changes: changes(before, after),
        sourceReview: structuredClone(sourceReview),
        confirmationPage: '/portal/account',
      };
    }).finally(() => this.#preparations.delete(preparation));
  }

  /** The authenticated account page can inspect only this subject's proposals. */
  public publications(subject: string) {
    this.expire();
    return structuredClone(
      [...this.#drafts.values()]
        .filter((draft) => draft.subject === subject)
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
          sourceReview: draft.sourceReview,
          result: draft.result,
        }))
    );
  }

  /** Only the out-of-band account route calls this method, never an MCP tool. */
  public approve(subject: string, id: string, digest: string) {
    return this.exclusive(subject, async () => {
      const draft = this.#drafts.get(id);
      if (!draft || draft.subject !== subject) throw new Error('Publication not found');
      if (draft.state !== 'prepared')
        throw new Error('Publication already attempted; inspect Portal before preparing again');
      if (draft.expiresAt <= Date.now()) throw new Error('Publication expired');
      draft.validateSource?.();
      if (digest !== draft.digest || draft.session !== draft.tool.exportSession())
        throw new Error('Local schema changed; prepare publication again');
      const credential = this.credential(subject, draft.targetId, 'publish');
      if (credential.generation !== draft.generation)
        throw new Error('Portal connection changed; prepare publication again');
      draft.validateSource?.();
      draft.state = 'sending';
      try {
        const result = await this.#api.request(credential.token, `/api/agents/rsforms/${draft.targetId}/publish`, {
          expected_time_update: draft.before.time_update,
          schema: draft.after,
        });
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
        draft.state = 'uncertain';
        throw error;
      }
    });
  }

  /** Closing a workspace invalidates proposals tied to its cached rstool instance. */
  public invalidateWorkspace(subject: string, workspace: string): void {
    for (const preparation of this.#preparations)
      if (preparation.subject === subject && preparation.workspace === workspace) preparation.invalidated = true;
    this.clearWorkspaceDrafts(subject, workspace);
  }

  /** Replace only the authenticated owner's proposal, without cancelling its current preparation. */
  private clearWorkspaceDrafts(subject: string, workspace: string): void {
    for (const [id, draft] of this.#drafts)
      if (draft.subject === subject && draft.workspace === workspace && draft.state !== 'sending')
        this.#drafts.delete(id);
  }

  private isService(subject: string): boolean {
    return this.#service?.subjects.includes(subject) ?? false;
  }

  /** Personal subjects never fall back to a service grant; service targets are explicitly restricted. */
  private credential(subject: string, targetId: number, requiredScope?: 'write' | 'publish'): PortalCredential {
    if (this.isService(subject)) {
      if (!this.#service!.targetIds.includes(targetId)) throw new Error('Service publication target is not allowed');
      return { token: this.#service!.token, generation: 'service', account: { id: 0, username: 'service' } };
    }
    const credential = this.#vault.get(subject);
    if (!credential) throw new Error('Connect a personal Portal key on the account page');
    if (expired(credential)) throw new Error('Portal key expired; reconnect on the account page');
    if (requiredScope && credential.keyPolicy && !credential.keyPolicy.scopes.includes(requiredScope))
      throw new Error('Portal key does not allow ' + requiredScope);
    if (requiredScope && credential.keyPolicy && !credential.keyPolicy.scopes.includes('read'))
      throw new Error('Portal key does not allow read, which is required to verify the target before mutation');
    return credential;
  }

  /** Credential replacement/disconnect removes every pending approval owned by this subject. */
  private invalidateSubject(subject: string): void {
    for (const [id, draft] of this.#drafts) if (draft.subject === subject) this.#drafts.delete(id);
  }

  /** Expire idle proposals without dropping an operation whose remote result is still pending. */
  private expire(): void {
    for (const [id, draft] of this.#drafts)
      if (draft.expiresAt <= Date.now() && draft.state !== 'sending') this.#drafts.delete(id);
  }

  /** Serialize credential changes with publication, with bounded global/per-subject queues. */
  private exclusive<T>(subject: string, operation: () => Promise<T>): Promise<T> {
    if (this.#pending >= 64 || (this.#counts.get(subject) ?? 0) >= 8)
      return Promise.reject(new Error('Portal queue is full'));
    this.#pending++;
    this.#counts.set(subject, (this.#counts.get(subject) ?? 0) + 1);
    const result = (this.#tails.get(subject) ?? Promise.resolve()).then(operation);
    const settled = result.then(
      () => undefined,
      () => undefined
    );
    this.#tails.set(subject, settled);
    void settled.then(() => {
      this.#pending--;
      const count = this.#counts.get(subject)! - 1;
      if (count) this.#counts.set(subject, count);
      else this.#counts.delete(subject);
      if (this.#tails.get(subject) === settled) this.#tails.delete(subject);
    });
    return result;
  }
}

function itemRoute(kind: PortalItemKind): string {
  const route = { schema: 'rsforms', model: 'models', oss: 'oss' }[kind];
  if (!route) throw new Error('Invalid Portal item kind');
  return route;
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
