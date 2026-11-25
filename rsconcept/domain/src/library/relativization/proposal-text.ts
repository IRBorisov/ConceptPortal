export type TextLocale = 'en' | 'ru' | 'fr';

import { type RelativizationRole } from './engine.mjs';

export type ProposalFields = {
  term_raw: string;
  definition_raw: string;
  convention: string;
};

type TextInput = {
  meaning: string;
  context: string;
  component: string;
  subject: string;
  isBaseSet: boolean;
};

type TextFactory = (input: TextInput) => [term: string, definition: string, convention: string];

const text: Record<TextLocale, Record<Exclude<RelativizationRole, 'preserved'>, TextFactory>> = {
  ru: {
    carrier: () => ['', 'Общее множество элементов, из которого образуются наборы для отдельных контекстов.', ''],
    axis: ({ context, subject, isBaseSet }) => [
      'допустимые контексты',
      isBaseSet
        ? 'Семейство допустимых наборов элементов множества «' + subject + '».'
        : 'Семейство допустимых значений родовой структуры «' + subject + '».',
      (isBaseSet ? 'Один контекст — набор элементов множества «' : 'Один контекст — целое значение структуры «') +
        subject +
        '». Общее имя одного контекста — «' +
        context +
        '». Исходное соглашение применяется внутри одного контекста.'
    ],
    relation: ({ meaning, context, isBaseSet }) => [
      meaning ? meaning + ' по контекстам' : '',
      'Отношение из пар «' + context + ', ' + (isBaseSet ? 'набор элементов' : 'значение в этом контексте') + '».',
      'Первая компонента пары задаёт допустимый контекст, вторая задаёт ' +
        (isBaseSet ? 'локальный набор элементов общего множества' : 'значение исходной структуры') +
        ' для этого контекста. Исходное соглашение относится ко второй компоненте.'
    ],
    family: ({ meaning, context, component }) => [
      meaning ? meaning + ' по контекстам' : '',
      'Семейство пар «' + context + ', вычисленное значение».',
      'Первая компонента задаёт контекст вычисления. Вторая содержит значение исходного выражения в этом контексте.' +
        (component ? ' Название компоненты в одном контексте — «' + component + '».' : '')
    ],
    callable: ({ meaning, context }) => [
      meaning ? meaning + ' с заданным контекстом' : '',
      'Первый аргумент задаёт контекст «' + context + '». Остальные аргументы передаются исходному выражению.',
      'Исходное соглашение о значении или условии применяется при фиксированном первом аргументе.'
    ],
    condition: ({ meaning }) => [
      meaning ? meaning + ' в каждом контексте' : '',
      'Исходное условие проверяется для каждого допустимого контекста.',
      'При каждой проверке используется исходная интерпретация условия в выбранном контексте.'
    ],
    accessor: ({ context }) => [
      'Дерелятивизация по контексту',
      'Из отношения выбираются пары с заданной первой компонентой «' +
        context +
        '», затем извлекается единственное значение второй компоненты.',
      'Для вычисления нужен ровно один срез. Срез может содержать пустое значение. При отсутствии среза или при нескольких значениях извлечение не определено.'
    ]
  },
  en: {
    carrier: () => ['', 'Common set of elements used to form subsets for individual contexts.', ''],
    axis: ({ context, subject, isBaseSet }) => [
      'admissible contexts',
      isBaseSet
        ? 'Family of admissible subsets of “' + subject + '”.'
        : 'Family of admissible values of the structure “' + subject + '”.',
      (isBaseSet ? 'One context is a subset of “' : 'One context is a whole value of “') +
        subject +
        '”. A single context is called “' +
        context +
        '”. The original convention applies within one context.'
    ],
    relation: ({ meaning, context, isBaseSet }) => [
      meaning ? meaning + ' by context' : '',
      'A relation of pairs of the form “' +
        context +
        ', ' +
        (isBaseSet ? 'subset of elements' : 'value in that context') +
        '”.',
      'The first component specifies an admissible context. The second specifies ' +
        (isBaseSet ? 'a subset of the common set' : 'the value of the original structure') +
        ' in that context. The original convention applies to the second component.'
    ],
    family: ({ meaning, context, component }) => [
      meaning ? meaning + ' by context' : '',
      'A family of pairs of the form “' + context + ', computed value”.',
      'The first component specifies the context. The second contains the value computed by the original expression in that context.' +
        (component ? ' The component within one context is called “' + component + '”.' : '')
    ],
    callable: ({ meaning, context }) => [
      meaning ? meaning + ' given a context' : '',
      'The first argument specifies the context “' +
        context +
        '”. The remaining arguments are passed to the original expression.',
      'The original convention for the value or condition applies at a fixed first argument.'
    ],
    condition: ({ meaning }) => [
      meaning ? meaning + ' in every context' : '',
      'The original condition is checked in every admissible context.',
      'Each check uses the original interpretation of the condition within that context.'
    ],
    accessor: ({ context }) => [
      'Derelativization by context',
      'Selects the pairs whose first component is the given “' +
        context +
        '” and extracts the unique second component.',
      'The computation requires exactly one slice. An empty value is a valid slice value. Extraction is undefined when the slice is missing or has several values.'
    ]
  },
  fr: {
    carrier: () => ['', 'Ensemble commun des éléments utilisés pour former les sous-ensembles de chaque contexte.', ''],
    axis: ({ context, subject, isBaseSet }) => [
      'contextes admissibles',
      isBaseSet
        ? 'Famille de sous-ensembles admissibles de « ' + subject + ' ».'
        : 'Famille de valeurs admissibles de la structure « ' + subject + ' ».',
      (isBaseSet ? 'Un contexte est un sous-ensemble de « ' : 'Un contexte est une valeur entière de « ') +
        subject +
        ' ». Un contexte individuel est appelé « ' +
        context +
        ' ». La convention source s’applique à un contexte à la fois.'
    ],
    relation: ({ meaning, context, isBaseSet }) => [
      meaning ? meaning + ' par contexte' : '',
      'Relation constituée de couples « ' +
        context +
        ', ' +
        (isBaseSet ? 'sous-ensemble d’éléments' : 'valeur dans ce contexte') +
        ' ».',
      'La première composante désigne un contexte admissible. La deuxième désigne ' +
        (isBaseSet ? 'un sous-ensemble de l’ensemble commun' : 'la valeur de la structure source') +
        ' dans ce contexte. La convention source s’applique à la deuxième composante.'
    ],
    family: ({ meaning, context, component }) => [
      meaning ? meaning + ' par contexte' : '',
      'Famille de couples « ' + context + ', valeur calculée ».',
      'La première composante désigne le contexte. La deuxième contient le résultat de l’expression source dans ce contexte.' +
        (component ? ' La composante dans un contexte s’appelle « ' + component + ' ».' : '')
    ],
    callable: ({ meaning, context }) => [
      meaning ? meaning + ' dans un contexte donné' : '',
      'Le premier argument fixe le contexte « ' +
        context +
        ' ». Les autres arguments sont transmis à l’expression source.',
      'La convention source s’applique à la valeur ou à la condition pour un premier argument fixé.'
    ],
    condition: ({ meaning }) => [
      meaning ? meaning + ' dans chaque contexte' : '',
      'La condition source est vérifiée dans chaque contexte admissible.',
      'Chaque vérification applique l’interprétation source de la condition dans le contexte choisi.'
    ],
    accessor: ({ context }) => [
      'Dérélativisation par contexte',
      'Sélectionne les couples dont la première composante est le « ' +
        context +
        ' » indiqué et extrait l’unique deuxième composante.',
      'Le calcul exige une seule tranche. Une tranche peut contenir une valeur vide. L’extraction est indéfinie si la tranche est absente ou contient plusieurs valeurs.'
    ]
  }
};

export function proposeText(
  role: RelativizationRole,
  original: ProposalFields,
  input: TextInput,
  locale: TextLocale,
  usesAccessor: boolean
): ProposalFields {
  if (role === 'preserved') return original;
  if (role === 'carrier') {
    return { ...original, definition_raw: original.definition_raw || text[locale].carrier(input)[1] };
  }
  const [term_raw, definition, convention] = text[locale][role](input);
  const sliceCondition = usesAccessor ? text[locale].accessor(input)[2] : '';
  return {
    term_raw,
    definition_raw: [definition, original.definition_raw].filter(Boolean).join('\n\n'),
    convention: [convention, original.convention, sliceCondition].filter(Boolean).join('\n\n')
  };
}
