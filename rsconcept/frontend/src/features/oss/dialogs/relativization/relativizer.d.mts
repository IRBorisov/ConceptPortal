import { type CstType, type TermForm } from '@rsconcept/domain/library/rsform';
import { type RSLangAnalyzer, type TokenID, type TypeID } from '@rsconcept/domain/rslang';
import { type extractGlobals, type parseRSLangExpression } from '@rsconcept/domain/rslang/api';
import { type labelType } from '@rsconcept/domain/rslang/labels';

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
}): {
  prepare: (items: SourceConstituent[]) => PreparedRelativization;
  transform: (
    prepared: PreparedRelativization,
    params: { target: string; ignored?: string[]; accessorTerm?: string; accessorConvention?: string }
  ) => { items: SourceConstituent[] } | null;
};
