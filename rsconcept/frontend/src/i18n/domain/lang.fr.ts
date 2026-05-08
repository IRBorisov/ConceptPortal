import { Grammeme } from '@/domain/cctext/language';

const GRAMMEME_FR: Record<string, string> = {
  [Grammeme.NOUN]: 'POS : nom',
  [Grammeme.VERB]: 'POS : verbe',
  [Grammeme.INFN]: 'POS : inf.',
  [Grammeme.ADJF]: 'POS : adj.',
  [Grammeme.PRTF]: 'POS : part.',
  [Grammeme.ADJS]: 'POS : adj. bref',
  [Grammeme.PRTS]: 'POS : part. bref',
  [Grammeme.COMP]: 'POS : compar.',
  [Grammeme.GRND]: 'POS : gérondif',
  [Grammeme.NUMR]: 'POS : num.',
  [Grammeme.ADVB]: 'POS : adv.',
  [Grammeme.NPRO]: 'POS : pron.',
  [Grammeme.PRED]: 'POS : predic.',
  [Grammeme.PREP]: 'POS : prép.',
  [Grammeme.CONJ]: 'POS : conj.',
  [Grammeme.PRCL]: 'POS : particule',
  [Grammeme.INTJ]: 'POS : interj.',
  [Grammeme.Abbr]: 'POS : abrév.',
  [Grammeme.sing]: 'Nombre : sg',
  [Grammeme.plur]: 'Nombre : pl',
  [Grammeme.nomn]: 'Cas : nom.',
  [Grammeme.gent]: 'Cas : gén.',
  [Grammeme.datv]: 'Cas : dat.',
  [Grammeme.accs]: 'Cas : acc.',
  [Grammeme.ablt]: 'Cas : ins.',
  [Grammeme.loct]: 'Cas : loc.'
};

const grammemeFrEntries = (Object.keys(GRAMMEME_FR) as Grammeme[]).map(
  grammeme => [`tx.lang.grammeme.${grammeme}`, GRAMMEME_FR[grammeme]] as const
);

export const txLangFr: Record<string, string> = {
  ...Object.fromEntries(grammemeFrEntries),

  'tx.lang.term': 'Terme',
  'tx.lang.term.hint': 'Abréviation pour les définitions textuelles',
  'tx.lang.term.validate.empty': 'Terme absent',
  'tx.lang.term.plural': 'Termes',
  'tx.lang.term.new': 'Nouveau terme',

  'tx.lang.definition': 'Définition',

  'tx.lang.morphology.nominal': 'Forme nominale',
  'tx.lang.wordform.plural.editing': 'Édition des formes de mots',
  'tx.lang.wordform.plural.editing.hint': 'Éditer les formes du mot',
  'tx.lang.wordform.plural.generate': 'Génération des formes de mots',
  'tx.lang.wordform.plural.generate.confirm':
    'La génération des formes de mots remplacera les formes existantes. Continuer ?',

  'tx.lang.reference.syntactic': 'Référence syntaxique',
  'tx.lang.reference.offset': 'Décalage de la référence de base',
  'tx.lang.reference.offset.short': 'Décalage',
  'tx.lang.reference.master': 'Référence de base',
  'tx.lang.reference.dependent': 'Mot dépendant',
  'tx.lang.reference.next': 'Référence suivante',
  'tx.lang.reference.prev': 'Référence précédente',
  'tx.lang.reference.save': 'Enregistrer la référence',

  'tx.lang.reference.entity': 'Référence à la constituante'
};
