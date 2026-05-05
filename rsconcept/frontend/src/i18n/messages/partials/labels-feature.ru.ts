/** Russian overrides for feature UI bundles (library, OSS, RS model, users, AI, cctext, RSLang). */
export const labelsFeatureUiRu: Record<string, string> = {
  'labels.rsform.cstClassLabel.nominal': 'номинальный',
  'labels.rsform.cstClassLabel.basic': 'базовый',
  'labels.rsform.cstClassLabel.derived': 'производный',
  'labels.rsform.cstClassLabel.statement': 'утверждение',
  'labels.rsform.cstClassLabel.template': 'шаблон',

  'labels.rsform.cstClassDesc.nominal': 'номинальная сущность',
  'labels.rsform.cstClassDesc.basic': 'неопределяемое понятие',
  'labels.rsform.cstClassDesc.derived': 'определяемое понятие',
  'labels.rsform.cstClassDesc.statement': 'логическое утверждение',
  'labels.rsform.cstClassDesc.template': 'шаблон определения',

  'labels.rsform.graphMode.explore': 'Режим: Просмотр',
  'labels.rsform.graphMode.edit': 'Режим: Редактор',

  'labels.rsform.coloring.none': 'Цвет: Моно',
  'labels.rsform.coloring.status': 'Цвет: Статус',
  'labels.rsform.coloring.type': 'Цвет: Класс',
  'labels.rsform.coloring.schemas': 'Цвет: Схемы',

  'labels.rsform.edgeType.full': 'Связь: Все',
  'labels.rsform.edgeType.definition': 'Связь: Определение',
  'labels.rsform.edgeType.attribution': 'Связь: Атрибутирование',

  'labels.rsform.exprStatus.verified': 'корректно',
  'labels.rsform.exprStatus.incorrect': 'ошибка',
  'labels.rsform.exprStatus.incalculable': 'невычислимо',
  'labels.rsform.exprStatus.property': 'неразмерное',
  'labels.rsform.exprStatus.unknown': 'не проверено',

  'labels.rsform.exprStatusDesc.verified': 'корректно и вычислимо',
  'labels.rsform.exprStatusDesc.incorrect': 'обнаружена ошибка',
  'labels.rsform.exprStatusDesc.incalculable': 'интерпретация не вычисляется',
  'labels.rsform.exprStatusDesc.property': 'только проверка принадлежности',
  'labels.rsform.exprStatusDesc.unknown': 'требуется проверка',

  'labels.rsform.rsExpression.nominal': 'Определяющие конституенты',
  'labels.rsform.rsExpression.structure': 'Область определения',
  'labels.rsform.rsExpression.function': 'Определение функции',

  'labels.oss.substitution.invalidIDs': 'Ошибка в идентификаторах схем',
  'labels.oss.substitution.incorrectCst': 'Ошибка {from} -> {to}: некорректное выражение конституенты',
  'labels.oss.substitution.invalidBasic': 'Ошибка {from} -> {to}: замена структурного понятия базисным множеством',
  'labels.oss.substitution.invalidConstant':
    'Ошибка {from} -> {to}: подстановка константного множества возможна только вместо другого константного',
  'labels.oss.substitution.invalidNominal':
    'Ошибка {from} -> {to}: подстановка номиноида возможна только вместо другого номиноида',
  'labels.oss.substitution.invalidClasses': 'Ошибка {from} -> {to}: классы конституент не совпадают',
  'labels.oss.substitution.typificationCycle': 'Ошибка: цикл подстановок в типизациях {detail}',
  'labels.oss.substitution.baseSubstitutionNotSet': 'Ошибка: типизация не задает множество {from} ∈ {to}',
  'labels.oss.substitution.unequalTypification': 'Ошибка {from} -> {to}: типизация структурных операндов не совпадает',
  'labels.oss.substitution.unequalArgsCount': 'Ошибка {from} -> {to}: количество аргументов не совпадает',
  'labels.oss.substitution.unequalArgs': 'Ошибка {from} -> {to}: типизация аргументов не совпадает',
  'labels.oss.substitution.unequalExpressions': 'Предупреждение {from} -> {to}: определения понятий не совпадают',

  'labels.rsmodel.valueDesc.cardinalityPrefix': 'Мощность: {n} | {stub}',

  'labels.ai.variable.block': 'Текущий блок операционной схемы',
  'labels.ai.variable.oss': 'Текущая операционная схема',
  'labels.ai.variable.schema': 'Текущая концептуальная схема',
  'labels.ai.variable.schemaThesaurus': 'Термины и определения текущей концептуальной схемы',
  'labels.ai.variable.schemaGraph': 'Граф связей определений конституент',
  'labels.ai.variable.schemaTypeGraph': 'Граф ступеней концептуальной схемы',
  'labels.ai.variable.constituenta': 'Текущая конституента',
  'labels.ai.variable.constituentaSyntaxTree': 'Синтаксическое дерево конституенты',
  'labels.ai.variableMock.block': 'Пример: Текущий блок операционной схемы',
  'labels.ai.variableMock.oss': 'Пример: Текущая операционная схема',
  'labels.ai.variableMock.schema': 'Пример: Текущая концептуальная схема',
  'labels.ai.variableMock.schemaThesaurus': 'Пример\nТермин1 - Определение1\nТермин2 - Определение2',
  'labels.ai.variableMock.schemaGraph': 'Пример: Граф связей определений конституент',
  'labels.ai.variableMock.schemaTypeGraph': 'Пример: Граф ступеней концептуальной схемы',
  'labels.ai.variableMock.constituenta': 'Пример: Текущая конституента',
  'labels.ai.variableMock.constituentaSyntaxTree': 'Пример синтаксического дерева конституенты'
};
