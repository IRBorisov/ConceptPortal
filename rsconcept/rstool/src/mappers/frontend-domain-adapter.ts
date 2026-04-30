import { RSLangAnalyzer, type AnalysisFull, type ValueClass } from '@/domain/rslang';
import { getAnalysisFor } from '@/domain/library/rsform-api';
import { CstType, type RSForm } from '@/domain/library/rsform';

import {
  type AnalysisResult,
  type ConstituentaDraft,
  type ConstituentaState,
  CstType as PublicCstType,
  type DiagnosticRecord,
  type SessionState
} from '../contracts/tool-contract';
import { toPublicAnalysis, toPublicError } from './types';

export class FrontendDomainAdapter {
  public analyzeAgainstSession(session: SessionState, draft: ConstituentaDraft): { result: AnalysisResult; diagnostics: DiagnosticRecord[] } {
    const analyzer = this.buildAnalyzer(session);
    const schema = this.toPseudoRSFormState(session, analyzer);
    const analysis = getAnalysisFor(
      draft.definitionFormal,
      toFrontendCstType(draft.cstType),
      schema as unknown as RSForm,
      draft.alias
    );
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

  public mergeStateWithDraft(session: SessionState, draft: ConstituentaDraft, analysis: AnalysisResult): ConstituentaState {
    const state: ConstituentaState = {
      ...draft,
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

  public toPseudoRSFormState(session: SessionState, analyzer: RSLangAnalyzer): Pick<RSForm, 'items' | 'cstByAlias' | 'analyzer'> {
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
      if (item.cstType === PublicCstType.BASE) {
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

function toFrontendCstType(cstType: ConstituentaDraft['cstType']): CstType {
  switch (cstType) {
    case PublicCstType.NOMINAL:
      return CstType.NOMINAL;
    case PublicCstType.BASE:
      return CstType.BASE;
    case PublicCstType.CONSTANT:
      return CstType.CONSTANT;
    case PublicCstType.STRUCTURED:
      return CstType.STRUCTURED;
    case PublicCstType.TERM:
      return CstType.TERM;
    case PublicCstType.FUNCTION:
      return CstType.FUNCTION;
    case PublicCstType.PREDICATE:
      return CstType.PREDICATE;
    case PublicCstType.AXIOM:
      return CstType.AXIOM;
    case PublicCstType.THEOREM:
      return CstType.THEOREM;
  }
}
