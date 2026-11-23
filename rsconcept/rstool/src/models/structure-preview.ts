/** A constituent selected by its numeric ID in the session. */
export interface PreviewStructureInput {
  constituentId: number;
}

export interface StructureConstituentRef {
  id: number;
  alias: string;
}

export interface StructurePreviewNode {
  key: string;
  path: number[];
  /** Zero-based index in the returned nodes, or null for the root. */
  parent: number | null;
  type: string;
  /** RSLang expression for a derived node, or the effective type label at the root. */
  definition: string;
  /** Constituent found by Portal's structure lookup, or the target itself at the root. */
  existing: StructureConstituentRef | null;
  /** Constituents whose normalized formal definitions match the generated expression. */
  definitionMatches: StructureConstituentRef[];
}

export interface StructurePreviewDiagnostic {
  code: 'INVALID_CONSTITUENT_ID' | 'CONSTITUENT_NOT_FOUND' | 'UNDEFINED_TYPIFICATION';
  message: string;
  constituentId?: number;
}

export type PreviewStructureResult =
  | { success: true; nodes: StructurePreviewNode[]; diagnostics: [] }
  | { success: false; nodes: []; diagnostics: [StructurePreviewDiagnostic] };
