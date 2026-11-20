import { readFileSync } from 'node:fs';

import { analyzeConstituentType, buildFormalDependencyGraph, isBaseSet } from '../src/library/rsform-api';
import { TYPE_BASIC } from '../src/library/rsmodel';
import { parseTypeText, RSLangAnalyzer } from '../src/rslang';
import { labelType, labelTypeShape, normalizeType } from '../src/rslang/labels';
import { type ExpressionType } from '../src/rslang/semantic/typification';

type Constituent = Parameters<typeof analyzeConstituentType>[0] & { id: number };
interface ModelTypeRequest {
  constituents: Constituent[];
  bindings: { id: number; type: string }[];
}

function describeBinding(cst: Constituent | undefined, type: ExpressionType | undefined | null, stored: string) {
  if (!cst || !type) {
    return { effective_type: null, type_diagnostic: 'effective_type_unavailable' };
  }
  return { effective_type: labelType(type), type_diagnostic: compareStoredType(cst, type, stored) };
}

function compareStoredType(cst: Constituent, type: ExpressionType, stored: string) {
  if (isBaseSet(cst.cst_type)) {
    return stored === TYPE_BASIC ? null : 'stored_type_mismatch';
  }
  if (stored.trim() === labelTypeShape(type)) {
    return null;
  }
  const parsedStored = parseTypeText(stored).type;
  const storedLabel = parsedStored ? labelType(parsedStored) : stored.trim();
  if (storedLabel === labelType(type)) {
    return null;
  }
  return storedLabel === normalizeType(type) ? 'normalized_stored_type' : 'stored_type_mismatch';
}

const { constituents, bindings } = JSON.parse(readFileSync(0, 'utf8')) as ModelTypeRequest;
const graph = buildFormalDependencyGraph(constituents);
const byId = new Map(constituents.map(cst => [cst.id, cst]));
const analyzer = new RSLangAnalyzer();
const effectiveTypes = new Map<number, ExpressionType | null>();
for (const id of graph.topologicalOrder()) {
  const { effectiveType } = analyzeConstituentType(byId.get(id)!, analyzer);
  effectiveTypes.set(id, effectiveType);
}
process.stdout.write(
  JSON.stringify(bindings.map(({ id, type }) => describeBinding(byId.get(id), effectiveTypes.get(id), type)))
);
