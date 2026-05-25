import { RSLangAnalyzer, type AnalysisFull, type ValueClass } from '@/domain/rslang';
import { getAnalysisFor } from '@/domain/library/rsform-api';
import { CstType, type RSForm } from '@/domain/library/rsform';

import {
  type AnalysisResult,
  type ConstituentaDraft,
  type ConstituentaState,
  type DiagnosticRecord,
  type SessionState
} from '../models';
import { toPublicAnalysis, toPublicError } from './types';

export class SchemaAdapter {
  public analyzeAgainstSession(
    session: SessionState,
    draft: ConstituentaDraft
  ): { result: AnalysisResult; diagnostics: DiagnosticRecord[] } {
    const analyzer = this.buildAnalyzer(session);
    const schema = this.toPseudoRSFormState(session, analyzer);
    const analysis = getAnalysisFor(draft.definitionFormal, draft.cstType, schema as unknown as RSForm, draft.alias);
    const result = toPublicAnalysis({
      success: analysis.success,
      type: analysis.type as Record<string, unknown> | null,
      valueClass: analysis.valueClass,
      errors: analysis.errors
    });
    return {
      result,
      diagnostics: analysis.errors.map(error => ({
        sessionId: session.sessionId,
        constituentId: draft.id,
        expression: draft.definitionFormal,
        error: toPublicError(error)
      }))
    };
  }

  public mergeStateWithDraft(
    session: SessionState,
    draft: ConstituentaDraft,
    analysis: AnalysisResult
  ): ConstituentaState {
    const state: ConstituentaState = {
      ...draft,
      term: draft.term ?? '',
      definitionText: draft.definitionText ?? '',
      convention: draft.convention ?? '',
      analysis
    };
    const index = session.items.findIndex(item => item.id === draft.id);
    if (index === -1) {
      session.items.push(state);
    } else {
      session.items[index] = state;
    }
    session.updatedAt = new Date().toISOString();
    return state;
  }

  public toPseudoRSFormState(
    session: SessionState,
    analyzer: RSLangAnalyzer
  ): Pick<RSForm, 'items' | 'cstByAlias' | 'analyzer'> {
    const cstByAlias = new Map(session.items.map(item => [item.alias, item]));
    return {
      items: session.items as unknown as RSForm['items'],
      cstByAlias: cstByAlias as unknown as RSForm['cstByAlias'],
      analyzer
    };
  }

  private buildAnalyzer(session: SessionState): RSLangAnalyzer {
    const analyzer = new RSLangAnalyzer();
    for (const item of session.items) {
      if (item.cstType === CstType.BASE) {
        analyzer.addBase(item.alias);
      }
      analyzer.setGlobal(
        item.alias,
        item.analysis.type as AnalysisFull['type'],
        item.analysis.valueClass as ValueClass | null
      );
    }
    return analyzer;
  }
}
