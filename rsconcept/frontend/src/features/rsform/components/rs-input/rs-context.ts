import { type EditorState, StateEffect, StateField } from '@codemirror/state';

import { type CstType, type RSForm } from '@rsconcept/domain/library';
import { refineAnalysisForDependencyCycles, typeClassForCstType } from '@rsconcept/domain/library/rsform-api';
import { type AnalysisFull, type RSErrorDescription } from '@rsconcept/domain/rslang';

/**
 * React-owned data consumed by RSInput editor extensions.
 *
 * Kept in editor state (instead of being captured by extension closures) so the extension list stays
 * referentially stable across renders and CodeMirror never has to reconfigure while the user types.
 */
export interface RSEditorContext {
  schema: RSForm | null;
  cstType: CstType | null;
  activeAlias: string | null;
  errors: readonly RSErrorDescription[] | null;
  parse: AnalysisFull | null;
  onParse: ((parse: AnalysisFull) => void) | null;
  onOpenEdit: ((cstID: number) => void) | null;
}

const EMPTY_CONTEXT: RSEditorContext = {
  schema: null,
  cstType: null,
  activeAlias: null,
  errors: null,
  parse: null,
  onParse: null,
  onOpenEdit: null
};

/** Effect that merges new values into {@link rsContextField}. */
export const setRSContext = StateEffect.define<Partial<RSEditorContext>>();

/** Editor state field holding the current {@link RSEditorContext}. */
export const rsContextField = StateField.define<RSEditorContext>({
  create: () => EMPTY_CONTEXT,
  update(value, transaction) {
    let result = value;
    for (const effect of transaction.effects) {
      if (effect.is(setRSContext)) {
        result = { ...result, ...effect.value };
      }
    }
    return result;
  }
});

/** Reads {@link RSEditorContext} from editor state (empty context if the field is not installed). */
export function readRSContext(state: EditorState): RSEditorContext {
  return state.field(rsContextField, false) ?? EMPTY_CONTEXT;
}

/** Returns only the entries of `next` that differ from `current`, or `null` if nothing changed. */
export function diffRSContext(current: RSEditorContext, next: RSEditorContext): Partial<RSEditorContext> | null {
  const delta: Partial<RSEditorContext> = {};
  let changed = false;
  for (const key of Object.keys(next) as (keyof RSEditorContext)[]) {
    if (current[key] !== next[key]) {
      (delta as Record<string, unknown>)[key] = next[key];
      changed = true;
    }
  }
  return changed ? delta : null;
}

/** Full analysis of `expression` used by RSInput diagnostics (types annotated for local tooltips). */
export function analyzeRSInput(
  expression: string,
  schema: RSForm,
  cstType: CstType | null,
  activeAlias: string | null
): AnalysisFull {
  return refineAnalysisForDependencyCycles(
    schema.analyzer.checkFull(expression, {
      annotateTypes: true,
      annotateErrors: true,
      expected: cstType !== null ? typeClassForCstType(cstType) : undefined
    }),
    expression,
    schema,
    activeAlias ?? undefined
  );
}
