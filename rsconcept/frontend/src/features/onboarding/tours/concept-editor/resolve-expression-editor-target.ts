import { type CstType } from '@rsconcept/domain/library';
import { isBaseSet } from '@rsconcept/domain/library/rsform-api';

/** Minimal constituenta fields needed to decide if expression-editor tour anchors mount. */
export interface ExpressionEditorTargetCst {
  id: number;
  cst_type: CstType;
  definition_formal: string;
}

export interface ExpressionEditorTargetSession {
  items: readonly ExpressionEditorTargetCst[];
  active: ExpressionEditorTargetCst | null;
}

/**
 * Mirrors FormConstituenta: EditorRSExpression mounts when the formal definition is
 * non-empty or the type is not an elementary base/constant set.
 */
export function showsExpressionEditor(cst: ExpressionEditorTargetCst): boolean {
  return !!cst.definition_formal || !isBaseSet(cst.cst_type);
}

/**
 * Id to select so concept-editor steps can spotlight expression UI.
 * Returns null when the current selection is already suitable, or when no candidate exists.
 */
export function resolveExpressionEditorTarget(session: ExpressionEditorTargetSession | null): number | null {
  if (!session?.items.length) {
    return null;
  }
  if (session.active && showsExpressionEditor(session.active)) {
    return null;
  }
  return session.items.find(showsExpressionEditor)?.id ?? null;
}
