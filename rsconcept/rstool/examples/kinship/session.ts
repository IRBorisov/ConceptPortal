import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { type BasicBinding, type RSToolWrapperClient, type SessionModelState } from '../../src';

import { S1_ID, S2_ID, S3_ID, X1_ID } from './constants';
import {
  addPerson,
  type Gender,
  type GenderRegistry,
  genderByNameFromSets,
  type S1Value,
  removePerson,
  renamePerson,
  remapS1ByNames,
  deriveGenderSets,
  setX1WithGender
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

function asIndexList(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is number => typeof item === 'number');
}

function getModelItem(model: SessionModelState, id: number): unknown {
  return model.items.find(item => item.id === id)?.value ?? null;
}

export class KinshipModelSession {
  private genderByName: GenderRegistry = {};

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
    const session = new KinshipModelSession(client, imported.sessionId, absolutePath);
    await session.loadGenderFromModel();
    return session;
  }

  private async loadGenderFromModel(): Promise<void> {
    const model = await this.getModelState();
    const binding = asBinding(getModelItem(model, X1_ID));
    const s2 = asIndexList(getModelItem(model, S2_ID));
    const s3 = asIndexList(getModelItem(model, S3_ID));
    this.genderByName = genderByNameFromSets(binding, s2, s3);
  }

  public getGenderByName(): Readonly<GenderRegistry> {
    return this.genderByName;
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
    const { s2, s3 } = deriveGenderSets(binding, this.genderByName);
    return this.client.call<SessionModelState>('setConstituentaValues', {
      sessionId: this.sessionId,
      input: {
        items: [
          { target: X1_ID, value: binding },
          { target: S1_ID, value: s1 },
          { target: S2_ID, value: s2 },
          { target: S3_ID, value: s3 }
        ]
      }
    });
  }

  private async clearModelValues(): Promise<SessionModelState> {
    return this.client.call<SessionModelState>('clearConstituentaValues', {
      sessionId: this.sessionId,
      input: { items: [X1_ID, S1_ID, S2_ID, S3_ID] }
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

  public async addPerson(name: string, gender: Gender): Promise<{ binding: BasicBinding; s1: S1Value }> {
    const binding = await this.getX1Binding();
    const s1 = await this.getS1Value();
    const nextBinding = addPerson(binding, name, gender, this.genderByName);
    await this.applyModelValues(nextBinding, s1);
    await this.recalculateModel();
    return { binding: nextBinding, s1 };
  }

  public async removePerson(name: string): Promise<{ binding: BasicBinding; s1: S1Value }> {
    const binding = await this.getX1Binding();
    const s1 = await this.getS1Value();
    const next = removePerson(binding, s1, name, this.genderByName);
    await this.applyModelValues(next.binding, next.s1);
    await this.recalculateModel();
    return next;
  }

  public async renamePerson(oldName: string, newName: string): Promise<BasicBinding> {
    const binding = await this.getX1Binding();
    const nextBinding = renamePerson(binding, oldName, newName, this.genderByName);
    const s1 = await this.getS1Value();
    await this.applyModelValues(nextBinding, s1);
    await this.recalculateModel();
    return nextBinding;
  }

  public async setX1People(specs: { gender: Gender; name: string }[]): Promise<{
    binding: BasicBinding;
    s1: S1Value;
  }> {
    const oldBinding = await this.getX1Binding();
    const s1 = await this.getS1Value();
    const { binding: nextBinding, genderByName } = setX1WithGender(specs);
    this.genderByName = genderByName;
    const nextS1 = remapS1ByNames(oldBinding, nextBinding, s1);
    await this.applyModelValues(nextBinding, nextS1);
    await this.recalculateModel();
    return { binding: nextBinding, s1: nextS1 };
  }

  public async clearX1(): Promise<void> {
    this.genderByName = {};
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
