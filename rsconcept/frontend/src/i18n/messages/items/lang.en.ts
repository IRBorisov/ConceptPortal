import { Grammeme } from '@/domain/cctext/language';

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

const grammemeEnEntries = (Object.keys(GRAMMEME_EN) as Grammeme[]).map(
  g => [`tx.lang.grammeme.${g}`, GRAMMEME_EN[g]] as const
);

export const txLangEn: Record<string, string> = {
  ...Object.fromEntries(grammemeEnEntries),

  'tx.lang.morphology.nominal': 'Nominal form',
  'tx.lang.wordform.plural.editing': 'Editing word forms',
  'tx.lang.wordform.plural.editing.hint': 'Edit term word forms',
  'tx.lang.wordform.plural.generate': 'Generating word forms',

  'tx.lang.reference.syntactic': 'Syntactic reference',
  'tx.lang.reference.offset': 'Offset',
  'tx.lang.reference.master': 'Master reference'
};
