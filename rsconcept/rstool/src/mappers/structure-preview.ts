import { type Constituenta, CstType } from '@rsconcept/domain/library/rsform';
import { analyzeSchemaConstituents, normalizeExpression } from '@rsconcept/domain/library/rsform-api';
import { StructurePlanner } from '@rsconcept/domain/library/structure-planner';
import { TypeID } from '@rsconcept/domain/rslang';
import { labelType } from '@rsconcept/domain/rslang/labels';
import { isTypification } from '@rsconcept/domain/rslang/semantic/typification';

import { type SessionState } from '../models/session';
import { type PreviewStructureResult, type StructureConstituentRef } from '../models/structure-preview';
import { buildRSFormFromSession } from './rsform-builder';

export function buildStructurePreview(session: SessionState, constituentId: number): PreviewStructureResult {
  if (!Number.isSafeInteger(constituentId)) {
    return {
      success: false,
      nodes: [],
      diagnostics: [{ code: 'INVALID_CONSTITUENT_ID', message: 'constituentId must be a safe integer.' }]
    };
  }
  if (!session.items.some(item => item.id === constituentId)) {
    return {
      success: false,
      nodes: [],
      diagnostics: [{ code: 'CONSTITUENT_NOT_FOUND', message: `Unknown constituent: ${constituentId}`, constituentId }]
    };
  }

  const schema = buildRSFormFromSession(session, { useStoredTypes: false });
  const normalizedDefinitions = analyzeSchemaConstituents(schema);
  const selected = schema.cstByID.get(constituentId)!;
  // The concept card opens the spawner's structure when invoked on a structural child.
  const target = selected.spawner_path && selected.spawner != null ? schema.cstByID.get(selected.spawner)! : selected;
  const type = target.effectiveType;
  if (!isTypification(type) && !(target.cst_type === CstType.FUNCTION && type?.typeID === TypeID.function)) {
    return {
      success: false,
      nodes: [],
      diagnostics: [{
        code: 'UNDEFINED_TYPIFICATION',
        message: `No structure typification is available for ${target.alias}.`,
        constituentId: target.id
      }]
    };
  }

  const matchesByDefinition = new Map<string, Constituenta[]>();
  for (const item of schema.items) {
    const definition = normalizedDefinitions.get(item.id);
    if (item.id === target.id || !definition) continue;
    const matches = matchesByDefinition.get(definition) ?? [];
    matches.push(item);
    matchesByDefinition.set(definition, matches);
  }

  const nodeType = target.cst_type === CstType.FUNCTION ? CstType.FUNCTION : CstType.TERM;
  const nodes = new StructurePlanner(schema, target).build().map(node => {
    const normalized = node.parent === null ? null : normalizeExpression(node.definition, nodeType);
    const matches = normalized ? matchesByDefinition.get(normalized) ?? [] : [];
    return {
      key: node.key,
      path: [...node.path],
      parent: node.parent,
      type: labelType(node.type),
      definition: node.definition,
      existing: node.existing ? toRef(node.existing) : null,
      definitionMatches: matches.map(toRef)
    };
  });
  return { success: true, nodes, diagnostics: [] };
}

function toRef(item: Constituenta): StructureConstituentRef {
  return { id: item.id, alias: item.alias };
}
