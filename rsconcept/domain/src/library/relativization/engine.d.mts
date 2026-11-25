import { type analyzeConstituentType } from '../rsform-api';
import { type CstType, type TermForm } from '../rsform';
import { type RSLangAnalyzer, type TokenID, type TypeID } from '../../rslang';
import { type extractGlobals, type parseRSLangExpression } from '../../rslang/api';
import { type labelType } from '../../rslang/labels';

interface SourceConstituent {
  entityUID: number;
  type: string;
  cstType: CstType;
  alias: string;
  convention?: string;
  crucial?: boolean;
  valueIsProperty?: boolean;
  term?: { raw: string; forms: TermForm[] };
  definition: { formal: string; typification_manual?: string; text?: { raw: string } };
}

export type RelativizationRole =
  'preserved' | 'carrier' | 'axis' | 'relation' | 'family' | 'callable' | 'condition' | 'accessor';

export interface TransformedConstituent extends SourceConstituent {
  origin: number | null;
  role: RelativizationRole;
}

interface PreparedRelativization {
  readonly items: SourceConstituent[];
}

export function createRelativizer(runtime: {
  RSLangAnalyzer: typeof RSLangAnalyzer;
  TokenID: typeof TokenID;
  TypeID: typeof TypeID;
  labelType: typeof labelType;
  parseRSLangExpression: typeof parseRSLangExpression;
  extractGlobals: typeof extractGlobals;
  analyzeConstituentType: typeof analyzeConstituentType;
}): {
  prepare: (items: SourceConstituent[]) => PreparedRelativization;
  transform: (
    prepared: PreparedRelativization,
    params: { target: string; ignored: string[] }
  ) => { items: TransformedConstituent[]; names: { context: string; value: string; graph: string } } | null;
};
