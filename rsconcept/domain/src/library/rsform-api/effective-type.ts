import { type AnalysisFast, parseTypeText, type RSLangAnalyzer, ValueClass } from '../../rslang';
import { labelType } from '../../rslang/labels';
import { type ExpressionType } from '../../rslang/semantic/typification';
import { type Constituenta, CstType } from '../rsform';

import { isBaseSet, typeClassForCstType } from './cst-type';

type TypeSource = Pick<
  Constituenta,
  'alias' | 'cst_type' | 'definition_formal' | 'typification_manual' | 'value_is_property'
>;

/** Analyze a constituent in dependency order and make its effective type available to dependents. */
export function analyzeConstituentType(cst: TypeSource, analyzer: RSLangAnalyzer) {
  const parse = parseConstituent(cst, analyzer);
  const manualType = parseTypeText(cst.typification_manual).type;
  const computedType = parse.success ? parse.type : null;
  const isManualMismatch =
    computedType !== null && !!cst.typification_manual && labelType(computedType) !== labelType(manualType);
  const effectiveType: ExpressionType | null =
    manualType !== null && (computedType === null || isManualMismatch) ? manualType : computedType;
  analyzer.setGlobal(cst.alias, effectiveType, parse.valueClass);
  return { parse, effectiveType, isManualMismatch };
}

function parseConstituent(cst: TypeSource, analyzer: RSLangAnalyzer): AnalysisFast {
  if (cst.cst_type === CstType.NOMINAL) {
    return { success: false, type: null, valueClass: null, ast: null };
  }
  if (isBaseSet(cst.cst_type)) {
    const valueClass = cst.value_is_property ? ValueClass.PROPERTY : ValueClass.VALUE;
    analyzer.addBase(cst.alias, cst.cst_type === CstType.CONSTANT, valueClass);
    return analyzer.checkFast(cst.alias);
  }
  const parse = analyzer.checkFast(cst.definition_formal, {
    expected: typeClassForCstType(cst.cst_type),
    isDomain: cst.cst_type === CstType.STRUCTURED
  });
  if (parse.success && cst.cst_type === CstType.STRUCTURED && cst.value_is_property) {
    parse.valueClass = ValueClass.PROPERTY;
  }
  return parse;
}
