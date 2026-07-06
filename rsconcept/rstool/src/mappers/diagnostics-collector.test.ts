import { describe, expect, it } from 'vitest';

import { CstType, RSDiagnosticCode, type SessionState, ValueClass } from '../models';
import {
  collectModelDiagnostics,
  collectSchemaDiagnostics,
  collectSessionDiagnostics
} from './diagnostics-collector';

function buildFixtureSession(): SessionState {
  return {
    sessionId: 'test',
    alias: '',
    title: '',
    comment: '',
    createdAt: '',
    updatedAt: '',
    revisions: [],
    model: { items: [] },
    items: [
      {
        id: 1,
        alias: 'X1',
        cstType: CstType.BASE,
        definitionFormal: 'Z',
        term: '',
        definitionText: '',
        convention: '',
        analysis: {
          success: false,
          type: null,
          valueClass: null,
          diagnostics: [{ code: 0x8862, from: 0, to: 1, params: [CstType.BASE, 'X1'] }]
        }
      },
      {
        id: 2,
        alias: 'X2',
        cstType: CstType.BASE,
        definitionFormal: '',
        term: 'person',
        definitionText: '',
        convention: 'people',
        analysis: { success: true, type: {}, valueClass: ValueClass.VALUE, diagnostics: [] }
      },
      {
        id: 3,
        alias: 'X3',
        cstType: CstType.BASE,
        definitionFormal: '',
        term: 'Person',
        definitionText: '',
        convention: 'other',
        analysis: { success: true, type: {}, valueClass: ValueClass.VALUE, diagnostics: [] }
      }
    ]
  };
}

describe('collectSchemaDiagnostics', () => {
  it('collects expression and schema diagnostics without model issues', () => {
    const records = collectSchemaDiagnostics(buildFixtureSession());

    expect(records.some(record => record.kind === 'expression')).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.schemaHomonym)).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.schemaMissingTerm)).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.modelEmpty)).toBe(false);
    expect(records.every(record => record.name.length > 0)).toBe(true);
  });
});

describe('collectModelDiagnostics', () => {
  it('collects model diagnostics for empty basic sets', () => {
    const records = collectModelDiagnostics(buildFixtureSession());

    expect(records.some(record => record.code === RSDiagnosticCode.modelEmpty)).toBe(true);
    expect(records.every(record => record.kind === 'model')).toBe(true);
  });
});

describe('collectSessionDiagnostics', () => {
  it('merges schema and model diagnostics', () => {
    const records = collectSessionDiagnostics(buildFixtureSession());

    expect(records.some(record => record.kind === 'expression')).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.schemaHomonym)).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.modelEmpty)).toBe(true);
  });
});
