import { describe, expect, it } from 'vitest';

import { CstType, RSErrorCode, RSDiagnosticCode, type SessionState, ValueClass } from '../models';
import { getDiagnosticSeverity } from './diagnostic-assembly';
import { collectSessionDiagnostics } from './diagnostics-collector';

describe('collectSessionDiagnostics', () => {
  it('collects expression, schema, and model diagnostics together', () => {
    const session = {
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

    const records = collectSessionDiagnostics(session as SessionState);
    expect(records.some(record => record.kind === 'expression')).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.schemaHomonym)).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.schemaMissingTerm)).toBe(true);
    expect(records.some(record => record.code === RSDiagnosticCode.modelEmpty)).toBe(true);
    expect(records.every(record => record.name.length > 0)).toBe(true);
  });

  it('uses explicit diagnostic severity from the domain library', () => {
    expect(getDiagnosticSeverity(RSErrorCode.localNotUsed)).toBe('warning');
    expect(getDiagnosticSeverity(RSErrorCode.unknownSyntax)).toBe('error');
    expect(getDiagnosticSeverity(RSDiagnosticCode.schemaHomonym)).toBe('error');
    expect(getDiagnosticSeverity(RSDiagnosticCode.modelEvalFail)).toBe('error');
    expect(getDiagnosticSeverity(0x2001)).toBe('error');
  });
});
