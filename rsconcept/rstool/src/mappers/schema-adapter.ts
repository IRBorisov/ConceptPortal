import { expressionDiagnostic } from './diagnostic-assembly';
import { RSLangAnalyzer, type AnalysisFull, type ValueClass } from '@rsconcept/domain/rslang';
import { type RSErrorDescription } from '@rsconcept/domain/rslang/error';
import { getAnalysisFor } from '@rsconcept/domain/library/rsform-api';
import { CstType, type RSForm } from '@rsconcept/domain/library/rsform';

import {
  type AnalysisResult,
  type ConstituentaDraft,
  type ConstituentaState,
  type Diagnostic,
  type SessionState
} from '../models';
import { toPublicAnalysis } from './types';

export class SchemaAdapter {
  public analyzeAgainstSession(
    session: SessionState,
    draft: ConstituentaDraft
  ): { result: AnalysisResult; diagnostics: Diagnostic[] } {
    const analyzer = this.buildAnalyzer(session);
    const schema = this.toPseudoRSFormState(session, analyzer);
    const analysis = getAnalysisFor(draft.definitionFormal, draft.cstType, schema as unknown as RSForm, draft.alias);
    const target = { constituentId: draft.id, alias: draft.alias };
    const result = toPublicAnalysis(
      {
        success: analysis.success,
        type: analysis.type as Record<string, unknown> | null,
        valueClass: analysis.valueClass,
        errors: analysis.errors
      },
      draft.definitionFormal,
      target
    );
    return {
      result,
      diagnostics: analysis.errors.map(error =>
        expressionDiagnostic(error as RSErrorDescription, draft.definitionFormal, target)
      )
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
