export { RSLangAnalyzer } from './models/analyzer';
export { type IRSErrorDescription, RSErrorCode } from './models/error';
export { TokenID } from './models/language';
export { TypeClass, TypeID } from './models/typification';
export { AnyTypificationT, EmptySetT, type ExpressionType, LogicT, type Typification } from './models/typification';
export { normalizeAST } from './parser/normalize';
export { parser as rslangParser } from './parser/parser';