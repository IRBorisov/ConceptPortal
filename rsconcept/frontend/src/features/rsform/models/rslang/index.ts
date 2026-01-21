export {
  applyAliasMapping,
  applyTypificationMapping,
  extractGlobals,
  getRSErrorPrefix,
  inferTemplatedType,
  isSetTypification,
  isSimpleExpression,
  splitTemplateDefinition,
  substituteTemplateArgs
} from './api';
export { normalizeAST } from './normalize';
export { parser as rslangParser } from './parser';
export {
  type AliasMapping,
  type IArgumentInfo,
  type IArgumentValue,
  type ITypeInfo,
  RSErrorClass
} from './types';