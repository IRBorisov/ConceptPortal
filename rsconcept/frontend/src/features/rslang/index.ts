export { RSErrorCode, type RSErrorDescription } from './error';
export { normalizeAST } from './parser/normalize';
export { parser as rslangParser } from './parser/parser';
export { TokenID } from './parser/token';
export { type AnalysisOutput, RSLangAnalyzer } from './semantic/analyzer';
export {
  AnyTypificationT,
  EmptySetT,
  type ExpressionType,
  LogicT,
  TypeClass,
  TypeID,
  type Typification
} from './semantic/typification';
export { ValueClass } from './semantic/value-class';