import { Grammeme } from '@/domain/cctext/language';

function grammemeId(g: Grammeme): string {
  return `labels.cctext.grammeme.${g}`;
}

/** English defaults for grammeme tooltips (compact UI). */
const GRAMMEME_EN: Record<Grammeme, string> = {
  [Grammeme.NOUN]: 'POS: noun',
  [Grammeme.VERB]: 'POS: verb',
  [Grammeme.INFN]: 'POS: infinitive',
  [Grammeme.ADJF]: 'POS: adj',
  [Grammeme.PRTF]: 'POS: participle',
  [Grammeme.ADJS]: 'POS: short adj',
  [Grammeme.PRTS]: 'POS: short participle',
  [Grammeme.COMP]: 'POS: comparative',
  [Grammeme.GRND]: 'POS: gerund',
  [Grammeme.NUMR]: 'POS: numeral',
  [Grammeme.ADVB]: 'POS: adverb',
  [Grammeme.NPRO]: 'POS: pronoun',
  [Grammeme.PRED]: 'POS: predicative',
  [Grammeme.PREP]: 'POS: prep',
  [Grammeme.CONJ]: 'POS: conj',
  [Grammeme.PRCL]: 'POS: particle',
  [Grammeme.INTJ]: 'POS: interj',
  [Grammeme.Abbr]: 'POS: abbr',
  [Grammeme.sing]: 'Number: sg',
  [Grammeme.plur]: 'Number: pl',
  [Grammeme.nomn]: 'Case: nom',
  [Grammeme.gent]: 'Case: gen',
  [Grammeme.datv]: 'Case: dat',
  [Grammeme.accs]: 'Case: acc',
  [Grammeme.ablt]: 'Case: ins',
  [Grammeme.loct]: 'Case: loc',
  [Grammeme.masc]: 'Gender: m',
  [Grammeme.femn]: 'Gender: f',
  [Grammeme.neut]: 'Gender: n',
  [Grammeme.perf]: 'Aspect: perf',
  [Grammeme.impf]: 'Aspect: impf',
  [Grammeme.tran]: 'Trans: yes',
  [Grammeme.intr]: 'Trans: no',
  [Grammeme.pres]: 'Tense: pres',
  [Grammeme.past]: 'Tense: past',
  [Grammeme.futr]: 'Tense: fut',
  [Grammeme.per1]: 'Person: 1',
  [Grammeme.per2]: 'Person: 2',
  [Grammeme.per3]: 'Person: 3',
  [Grammeme.impr]: 'Mood: impr',
  [Grammeme.indc]: 'Mood: ind',
  [Grammeme.incl]: 'Incl: yes',
  [Grammeme.excl]: 'Incl: no',
  [Grammeme.pssv]: 'Voice: pass',
  [Grammeme.actv]: 'Voice: act',
  [Grammeme.anim]: 'Anim: yes',
  [Grammeme.inan]: 'Anim: no',
  [Grammeme.Infr]: 'Style: informal',
  [Grammeme.Slng]: 'Style: slang',
  [Grammeme.Arch]: 'Style: archaic',
  [Grammeme.Litr]: 'Style: literary'
};

export const cctextLid = {
  grammemeUnknown: 'labels.cctext.grammemeUnknown'
} as const;

export const CCTEXT_UI_DEFAULTS: Record<string, string> = {
  [cctextLid.grammemeUnknown]: 'Unknown: {gram}',
  ...Object.fromEntries((Object.keys(GRAMMEME_EN) as Grammeme[]).map(g => [grammemeId(g), GRAMMEME_EN[g]]))
};

export function labelGrammemeMessageId(gram: Grammeme): string {
  return grammemeId(gram);
}
