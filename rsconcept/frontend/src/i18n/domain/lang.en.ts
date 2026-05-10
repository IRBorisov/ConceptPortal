import { Grammeme } from '@/domain/cctext/language';

/** English defaults for grammeme tooltips (compact UI). */
const GRAMMEME_EN: Record<string, string> = {
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
  [Grammeme.loct]: 'Case: loc'
};

const grammemeEnEntries = (Object.keys(GRAMMEME_EN) as Grammeme[]).map(
  g => [`tx.lang.grammeme.${g}`, GRAMMEME_EN[g]] as const
);

export const txLangEn: Record<string, string> = {
  ...Object.fromEntries(grammemeEnEntries),

  'tx.lang.term': 'Term',
  'tx.lang.term.hint': 'Abbreviation for textual definitions',
  'tx.lang.term.validate.empty': 'Term is missing',
  'tx.lang.term.plural': 'Terms',
  'tx.lang.term.new': 'New term',

  'tx.lang.definition': 'Definition',

  'tx.lang.morphology.nominal': 'Nominal form',
  'tx.lang.wordform.plural.editing': 'Editing word forms',
  'tx.lang.wordform.plural.editing.hint': 'Edit term word forms',
  'tx.lang.wordform.plural.generate': 'Generating word forms',
  'tx.lang.wordform.plural.generate.confirm': 'Generating word forms will overwrite existing forms. Continue?',

  'tx.lang.reference.syntactic': 'Syntactic reference',
  'tx.lang.reference.offset': 'Base reference offset',
  'tx.lang.reference.offset.short': 'Offset',
  'tx.lang.reference.master': 'Base reference',
  'tx.lang.reference.dependent': 'Dependent word',
  'tx.lang.reference.next': 'Next reference',
  'tx.lang.reference.prev': 'Previous reference',
  'tx.lang.reference.save': 'Save reference',

  'tx.lang.reference.entity': 'Reference to constituent',

  'tx.lang.thesaurus': 'Thesaurus',
  'tx.lang.thesaurus.hint': 'Portal terminology',
  'tx.lang.terminologyControl': 'Terminology control',
  'tx.lang.terminologyControl.hint': 'Controlling terms and textual references'
};
