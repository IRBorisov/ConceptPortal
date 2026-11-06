import { createHash, randomUUID } from 'node:crypto';

import type { RSToolAgent } from '@rsconcept/rstool';

import { PortalClient } from './portal-client';
import { PortalVault, type PortalCredential } from './portal-vault';

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
  before: Record<string, any>;
  after: Record<string, any>;
  state: 'prepared' | 'sending' | 'published' | 'uncertain' | 'failed';
  result?: unknown;
}

/** Own the external publication lifecycle; RS validation and editing stay in rstool. */
export class PortalPublisher {
  readonly #vault: PortalVault;
  readonly #api: PortalClient;
  readonly #service?: ServicePortalCredential;
  readonly #drafts = new Map<string, PreparedPublication>();
  readonly #tails = new Map<string, Promise<unknown>>();
  #pending = 0;
  readonly #counts = new Map<string, number>();

  /** Validate and copy administrator-only service grants, without accepting runtime tool overrides. */
  public constructor(vault: PortalVault, api: PortalClient, service?: ServicePortalCredential) {
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
      this.#vault.set(subject, token, { id: account.id, username: account.username });
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
      ? { connected: true, mode: 'personal', account: credential.account }
      : { connected: false, mode: 'personal' };
  }

  /** Capture immutable before/after JSON. This method never writes to Portal. */
  public prepare(subject: string, workspace: string, targetId: number, tool: RSToolAgent) {
    return this.exclusive(subject, async () => {
      if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('A positive Portal schema ID is required');
      this.expire();
      const credential = this.credential(subject, targetId);
      if (tool.listDiagnostics().some((diagnostic) => diagnostic.kind === 'schema' && diagnostic.severity === 'error'))
        throw new Error('Resolve schema diagnostics before preparing publication');
      const session = tool.exportSession();
      const after = JSON.parse(tool.exportPortal({ kind: 'schema', format: 'json' }) as string);
      const before = await this.#api.request(credential.token, `/api/agents/rsforms/${targetId}/details`);
      if (typeof before.time_update !== 'string' || !Array.isArray(before.items))
        throw new Error('Portal returned invalid schema metadata');
      // One proposal per live workspace; bounded storage for all subjects.
      this.invalidateWorkspace(workspace);
      const bytes = Buffer.byteLength(JSON.stringify({ before, after }));
      const occupied = [...this.#drafts.values()].reduce(
        (size, draft) => size + Buffer.byteLength(JSON.stringify({ before: draft.before, after: draft.after })),
        0
      );
      if (this.#drafts.size >= 32 || bytes + occupied > 16 * 1024 * 1024)
        throw new Error('Publication capacity reached');
      const id = randomUUID();
      const digest = createHash('sha256').update(JSON.stringify({ targetId, before, after })).digest('hex');
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
        before,
        after,
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
        confirmationPage: '/portal/account',
      };
    });
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
      if (digest !== draft.digest || draft.session !== draft.tool.exportSession())
        throw new Error('Local schema changed; prepare publication again');
      const credential = this.credential(subject, draft.targetId);
      if (credential.generation !== draft.generation)
        throw new Error('Portal connection changed; prepare publication again');
      draft.state = 'sending';
      try {
        const result = await this.#api.request(credential.token, `/api/agents/rsforms/${draft.targetId}/publish`, {
          expected_time_update: draft.before.time_update,
          schema: draft.after,
        });
        // Read back separately. A failed verification is uncertain, never auto-retried.
        const verified = await this.#api.request(credential.token, `/api/agents/rsforms/${draft.targetId}/details`);
        if (
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
  public invalidateWorkspace(workspace: string): void {
    for (const [id, draft] of this.#drafts)
      if (draft.workspace === workspace && draft.state !== 'sending') this.#drafts.delete(id);
  }

  private isService(subject: string): boolean {
    return this.#service?.subjects.includes(subject) ?? false;
  }

  /** Personal subjects never fall back to a service grant; service targets are explicitly restricted. */
  private credential(subject: string, targetId: number): PortalCredential {
    if (this.isService(subject)) {
      if (!this.#service!.targetIds.includes(targetId)) throw new Error('Service publication target is not allowed');
      return { token: this.#service!.token, generation: 'service', account: { id: 0, username: 'service' } };
    }
    const credential = this.#vault.get(subject);
    if (!credential) throw new Error('Connect a personal Portal key on the account page');
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
    attribution: (schema.attribution ?? []).map((entry: { container: number; attribute: number }) => ({
      container: aliases.get(entry.container),
      attribute: aliases.get(entry.attribute),
    })),
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
  return {
    added: [...newItems.keys()].filter((alias) => !oldItems.has(alias)),
    removed: [...oldItems.keys()].filter((alias) => !newItems.has(alias)),
    changed: [...newItems.keys()].filter((alias) => oldItems.has(alias) && oldItems.get(alias) !== newItems.get(alias)),
    metadataChanged: ['title', 'alias', 'description'].filter(
      (field) => (before[field] ?? '') !== (after[field] ?? '')
    ),
  };
}
