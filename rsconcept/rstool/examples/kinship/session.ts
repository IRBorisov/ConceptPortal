import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { type BasicBinding, type RSToolWrapperClient, type SessionModelState } from '../../src';

import { S1_ID, X1_ID } from './constants';
import {
  addPerson,
  type S1Value,
  removePerson,
  renamePerson,
  remapS1ByNames,
  setX1List
} from './x1-actions';

function asBinding(value: unknown): BasicBinding {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const binding: BasicBinding = {};
  for (const [key, name] of Object.entries(value)) {
    if (typeof name === 'string') {
      binding[Number(key)] = name;
    }
  }
  return binding;
}

function asS1Value(value: unknown): S1Value {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(item => Array.isArray(item)) as S1Value;
}

function getModelItem(model: SessionModelState, id: number): unknown {
  return model.items.find(item => item.id === id)?.value ?? null;
}

export class KinshipModelSession {
  public constructor(
    private readonly client: RSToolWrapperClient,
    public readonly sessionId: string,
    public readonly sessionPath: string
  ) {}

  public static async open(
    client: RSToolWrapperClient,
    sessionPath: string
  ): Promise<KinshipModelSession> {
    const absolutePath = resolve(process.cwd(), sessionPath);
    const payload = await readFile(absolutePath, 'utf8');
    const imported = await client.call<{ sessionId: string }>('importSession', { payload });
    return new KinshipModelSession(client, imported.sessionId, absolutePath);
  }

  public async getModelState(): Promise<SessionModelState> {
    return this.client.call<SessionModelState>('getModelState', { sessionId: this.sessionId });
  }

  public async getX1Binding(): Promise<BasicBinding> {
    const model = await this.getModelState();
    return asBinding(getModelItem(model, X1_ID));
  }

  public async getS1Value(): Promise<S1Value> {
    const model = await this.getModelState();
    return asS1Value(getModelItem(model, S1_ID));
  }

  private async applyModelValues(binding: BasicBinding, s1: S1Value): Promise<SessionModelState> {
    return this.client.call<SessionModelState>('setConstituentaValues', {
      sessionId: this.sessionId,
      input: {
        items: [
          { target: X1_ID, value: binding },
          { target: S1_ID, value: s1 }
        ]
      }
    });
  }

  private async clearModelValues(): Promise<SessionModelState> {
    return this.client.call<SessionModelState>('clearConstituentaValues', {
      sessionId: this.sessionId,
      input: { items: [X1_ID, S1_ID] }
    });
  }

  public async recalculateModel(): Promise<void> {
    await this.client.call('recalculateModel', { sessionId: this.sessionId });
  }

  public async commitStep(message: string): Promise<void> {
    await this.client.call('commitStep', { sessionId: this.sessionId, message });
  }

  public async save(outputPath = this.sessionPath): Promise<string> {
    const exported = await this.client.call<string>('exportSession', { sessionId: this.sessionId });
    const absolutePath = resolve(process.cwd(), outputPath);
    await writeFile(absolutePath, exported, 'utf8');
    return absolutePath;
  }

  public async addPerson(name: string): Promise<{ binding: BasicBinding; s1: S1Value }> {
    const binding = await this.getX1Binding();
    const s1 = await this.getS1Value();
    const nextBinding = addPerson(binding, name);
    await this.applyModelValues(nextBinding, s1);
    await this.recalculateModel();
    return { binding: nextBinding, s1 };
  }

  public async removePerson(name: string): Promise<{ binding: BasicBinding; s1: S1Value }> {
    const binding = await this.getX1Binding();
    const s1 = await this.getS1Value();
    const next = removePerson(binding, s1, name);
    await this.applyModelValues(next.binding, next.s1);
    await this.recalculateModel();
    return next;
  }

  public async renamePerson(oldName: string, newName: string): Promise<BasicBinding> {
    const binding = await this.getX1Binding();
    const nextBinding = renamePerson(binding, oldName, newName);
    const s1 = await this.getS1Value();
    await this.applyModelValues(nextBinding, s1);
    await this.recalculateModel();
    return nextBinding;
  }

  public async setX1List(names: string[]): Promise<{ binding: BasicBinding; s1: S1Value }> {
    const oldBinding = await this.getX1Binding();
    const s1 = await this.getS1Value();
    const nextBinding = setX1List(names);
    const nextS1 = remapS1ByNames(oldBinding, nextBinding, s1);
    await this.applyModelValues(nextBinding, nextS1);
    await this.recalculateModel();
    return { binding: nextBinding, s1: nextS1 };
  }

  public async clearX1(): Promise<void> {
    await this.clearModelValues();
    await this.recalculateModel();
  }
}

export async function withKinshipSession<T>(
  client: RSToolWrapperClient,
  sessionPath: string,
  action: (session: KinshipModelSession) => Promise<T>
): Promise<T> {
  const session = await KinshipModelSession.open(client, sessionPath);
  return action(session);
}
