import { describe, expect, it } from 'vitest';

import { RSErrorCode } from '../rslang/error';

import {
  getDiagnosticSeverity,
  isDiagnosticCritical,
  isDiagnosticWarning,
  RSDiagnosticCode
} from './diagnostics';

describe('diagnostic severity', () => {
  it('treats only explicitly registered codes as warnings', () => {
    expect(isDiagnosticWarning(RSErrorCode.localNotUsed)).toBe(true);
    expect(isDiagnosticCritical(RSErrorCode.localNotUsed)).toBe(false);
    expect(getDiagnosticSeverity(RSErrorCode.localNotUsed)).toBe('warning');
  });

  it('treats RSLang errors, schema diagnostics, model diagnostics, and unknown codes as errors', () => {
    expect(getDiagnosticSeverity(RSErrorCode.unknownSyntax)).toBe('error');
    expect(getDiagnosticSeverity(RSDiagnosticCode.schemaHomonym)).toBe('error');
    expect(getDiagnosticSeverity(RSDiagnosticCode.modelEvalFail)).toBe('error');
    expect(getDiagnosticSeverity(0x2001)).toBe('error');
  });
});
