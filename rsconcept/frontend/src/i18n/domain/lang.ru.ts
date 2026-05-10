import { Grammeme } from '@/domain/cctext/language';

const GRAMMEME_RU: Record<string, string> = {
  [Grammeme.NOUN]: 'ЧР: сущ',
  [Grammeme.VERB]: 'ЧР: глагол',
  [Grammeme.INFN]: 'ЧР: глагол инф',
  [Grammeme.ADJF]: 'ЧР: прил',
  [Grammeme.PRTF]: 'ЧР: прич',
  [Grammeme.ADJS]: 'ЧР: кр прил',
  [Grammeme.PRTS]: 'ЧР: кр прич',
  [Grammeme.COMP]: 'ЧР: компаратив',
  [Grammeme.GRND]: 'ЧР: деепричастие',
  [Grammeme.NUMR]: 'ЧР: число',
  [Grammeme.ADVB]: 'ЧР: наречие',
  [Grammeme.NPRO]: 'ЧР: местоимение',
  [Grammeme.PRED]: 'ЧР: предикатив',
  [Grammeme.PREP]: 'ЧР: предлог',
  [Grammeme.CONJ]: 'ЧР: союз',
  [Grammeme.PRCL]: 'ЧР: частица',
  [Grammeme.INTJ]: 'ЧР: междометие',
  [Grammeme.Abbr]: 'ЧР: аббревиатура',
  [Grammeme.sing]: 'Число: един',
  [Grammeme.plur]: 'Число: множ',
  [Grammeme.nomn]: 'Падеж: имен',
  [Grammeme.gent]: 'Падеж: род',
  [Grammeme.datv]: 'Падеж: дат',
  [Grammeme.accs]: 'Падеж: вин',
  [Grammeme.ablt]: 'Падеж: твор',
  [Grammeme.loct]: 'Падеж: пред'
};

const grammemeRuEntries = (Object.keys(GRAMMEME_RU) as Grammeme[]).map(
  grammeme => [`tx.lang.grammeme.${grammeme}`, GRAMMEME_RU[grammeme]] as const
);

export const txLangRu: Record<string, string> = {
  ...Object.fromEntries(grammemeRuEntries),

  'tx.lang.term': 'Термин',
  'tx.lang.term.hint': 'Обозначение для текстовых определений',
  'tx.lang.term.validate.empty': 'Термин отсутствует',
  'tx.lang.term.plural': 'Термины',
  'tx.lang.term.new': 'Новый термин',

  'tx.lang.definition': 'Определение',

  'tx.lang.morphology.nominal': 'Начальная форма',
  'tx.lang.wordform.plural.editing': 'Редактирование словоформ',
  'tx.lang.wordform.plural.editing.hint': 'Редактировать словоформы термина',
  'tx.lang.wordform.plural.generate': 'Генерация словоформ',
  'tx.lang.wordform.plural.generate.confirm':
    'Генерация словоформ приведет к перезаписи существующих словоформ. Продолжить?',

  'tx.lang.reference.syntactic': 'Синтаксическая ссылка',
  'tx.lang.reference.offset': 'Смещение опорной ссылки',
  'tx.lang.reference.offset.short': 'Смещение',
  'tx.lang.reference.master': 'Опорная ссылка',
  'tx.lang.reference.dependent': 'Зависимое слово',
  'tx.lang.reference.next': 'Следующая ссылка',
  'tx.lang.reference.prev': 'Предыдущая ссылка',
  'tx.lang.reference.save': 'Сохранить ссылку',

  'tx.lang.reference.entity': 'Ссылка на конституенту',

  'tx.lang.thesaurus': 'Тезаурус',
  'tx.lang.thesaurus.hint': 'Термины Портала',
  'tx.lang.terminologyControl': 'Терминологизация',
  'tx.lang.terminologyControl.hint': 'Контроль терминов и текстовых отсылок'
};
