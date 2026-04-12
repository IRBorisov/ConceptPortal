export {
  type EntityReference,
  Grammeme,
  ReferenceType,
  supportedGrammemes,
  type SyntacticReference,
  type WordForm
} from './language';
export {
  getCompatibleGrams,
  parseEntityReference,
  parseGrammemes,
  parseSyntacticReference,
  referenceToString,
  wordFormEquals
} from './language-api';
export { type EntityRefState, type InlinePosition, type SyntacticRefState } from './reference';
