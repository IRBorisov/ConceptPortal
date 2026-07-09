import { getAnalysisFor } from '@rsconcept/domain/library/rsform-api';
import { type RSForm } from '@rsconcept/domain/library/rsform';
import { RSLangAnalyzer } from '@rsconcept/domain/rslang';

import {
  type AnalysisResult,
  type ConstituentaDraft,
  type ConstituentaState,
  type Diagnostic,
  type SessionState
} from '../models';
import { buildRSFormFromSession } from './rsform-builder';
import { toPublicAnalysis } from './types';

export class SchemaAdapter {
  public analyzeAgainstSession(
    session: SessionState,
    draft: ConstituentaDraft
  ): { result: AnalysisResult; diagnostics: Diagnostic[] } {
    const schema = this.toAnalysisSchema(session, draft);
    const analysis = getAnalysisFor(draft.definitionFormal, draft.cstType, schema, draft.alias);
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
      diagnostics: result.diagnostics
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

  /**
   * Schema view for analysis: session items with the draft expression merged in so the
   * dependency graph (and cycle diagnostics) reflect the expression under check.
   */
  private toAnalysisSchema(session: SessionState, draft: ConstituentaDraft): RSForm {
    const items = session.items.map(item => {
      if (item.id !== draft.id) {
        return item;
      }
      return {
        ...item,
        alias: draft.alias,
        cstType: draft.cstType,
        definitionFormal: draft.definitionFormal,
        term: draft.term ?? item.term,
        definitionText: draft.definitionText ?? item.definitionText,
        convention: draft.convention ?? item.convention,
        // Drop cached type so mutual references surface as untyped → cycle.
        analysis: {
          ...item.analysis,
          success: false,
          type: null,
          valueClass: null
        }
      };
    });
    if (!items.some(item => item.id === draft.id)) {
      items.push({
        id: draft.id,
        alias: draft.alias,
        cstType: draft.cstType,
        definitionFormal: draft.definitionFormal,
        term: draft.term ?? '',
        definitionText: draft.definitionText ?? '',
        convention: draft.convention ?? '',
        analysis: {
          success: false,
          type: null,
          valueClass: null,
          diagnostics: []
        }
      });
    }

    return buildRSFormFromSession({ ...session, items });
  }
}
