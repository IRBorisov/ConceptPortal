import { Grammeme } from '@/domain/cctext/language';
import { RSErrorCode } from '@/domain/rslang/error';

import { aiLid } from '@/app/i18n/labels/ai-ui';
import { cctextLid, labelGrammemeMessageId } from '@/app/i18n/labels/cctext-ui';
import { libraryLid } from '@/app/i18n/labels/library-ui';
import { ossLid } from '@/app/i18n/labels/oss-ui';
import { rslangLid } from '@/app/i18n/labels/rslang-ui';
import { rsmodelLid } from '@/app/i18n/labels/rsmodel-ui';
import { usersLid } from '@/app/i18n/labels/users-ui';

const GRAMMEME_RU: Record<Grammeme, string> = {
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
  [Grammeme.loct]: 'Падеж: пред',
  [Grammeme.masc]: 'Род: муж',
  [Grammeme.femn]: 'Род: жен',
  [Grammeme.neut]: 'Род: ср',
  [Grammeme.perf]: 'Совершенный: да',
  [Grammeme.impf]: 'Совершенный: нет',
  [Grammeme.tran]: 'Переходный: да',
  [Grammeme.intr]: 'Переходный: нет',
  [Grammeme.pres]: 'Время: настоящее',
  [Grammeme.past]: 'Время: прошедшее',
  [Grammeme.futr]: 'Время: будущее',
  [Grammeme.per1]: 'Лицо: 1',
  [Grammeme.per2]: 'Лицо: 2',
  [Grammeme.per3]: 'Лицо: 3',
  [Grammeme.impr]: 'Повелительный: да',
  [Grammeme.indc]: 'Повелительный: нет',
  [Grammeme.incl]: 'Включающий: да',
  [Grammeme.excl]: 'Включающий: нет',
  [Grammeme.pssv]: 'Страдательный: да',
  [Grammeme.actv]: 'Страдательный: нет',
  [Grammeme.anim]: 'Одушевленный: да',
  [Grammeme.inan]: 'Одушевленный: нет',
  [Grammeme.Infr]: 'Стиль: неформальный',
  [Grammeme.Slng]: 'Стиль: жаргон',
  [Grammeme.Arch]: 'Стиль: устаревший',
  [Grammeme.Litr]: 'Стиль: литературный'
};

const grammemeRuEntries = (Object.keys(GRAMMEME_RU) as Grammeme[]).map(g => [labelGrammemeMessageId(g), GRAMMEME_RU[g]] as const);

/** Russian overrides for feature UI bundles (library, OSS, RS model, users, AI, cctext, RSLang). */
export const labelsFeatureUiRu: Record<string, string> = {
  [libraryLid.location.user]: '/U : личные',
  [libraryLid.location.common]: '/S : общие',
  [libraryLid.location.library]: '/L : примеры',
  [libraryLid.location.projects]: '/P : проекты',
  [libraryLid.locationShort.user]: 'Личные',
  [libraryLid.locationShort.common]: 'Общие',
  [libraryLid.locationShort.library]: 'Примеры',
  [libraryLid.locationShort.projects]: 'Проекты',
  [libraryLid.locationDesc.user]: 'Личные схемы пользователя',
  [libraryLid.locationDesc.common]: 'Рабочий каталог публичных схем',
  [libraryLid.locationDesc.library]: 'Каталог неизменных схем-примеров',
  [libraryLid.locationDesc.projects]: 'Рабочий каталог проектных схем',
  [libraryLid.access.private]: 'Личный',
  [libraryLid.access.protected]: 'Защищенный',
  [libraryLid.access.public]: 'Открытый',
  [libraryLid.accessDesc.private]: 'Доступ только для владельца',
  [libraryLid.accessDesc.protected]: 'Доступ для владельца и редакторов',
  [libraryLid.accessDesc.public]: 'Открытый доступ',
  [libraryLid.itemType.rsform]: 'КС',
  [libraryLid.itemType.oss]: 'ОСС',
  [libraryLid.itemType.rsmodel]: 'Модель',
  [libraryLid.itemTypeDesc.rsform]: 'Концептуальная схема',
  [libraryLid.itemTypeDesc.oss]: 'Операционная схема синтеза',
  [libraryLid.itemTypeDesc.rsmodel]: 'Концептуальная модель',
  [libraryLid.version.current]: 'актуальная',

  [ossLid.operation.input]: 'Загрузка',
  [ossLid.operation.synthesis]: 'Синтез',
  [ossLid.operation.replica]: 'Репликация',
  [ossLid.operationDesc.input]: 'Загрузка концептуальной схемы в ОСС',
  [ossLid.operationDesc.synthesis]: 'Синтез концептуальных схем',
  [ossLid.operationDesc.replica]: 'Создание ссылки на результат операции',
  [ossLid.item.blockTitle]: 'Блок: {title}',
  [ossLid.substitution.invalidIDs]: 'Ошибка в идентификаторах схем',
  [ossLid.substitution.incorrectCst]:
    'Ошибка {from} -> {to}: некорректное выражение конституенты',
  [ossLid.substitution.invalidBasic]:
    'Ошибка {from} -> {to}: замена структурного понятия базисным множеством',
  [ossLid.substitution.invalidConstant]:
    'Ошибка {from} -> {to}: подстановка константного множества возможна только вместо другого константного',
  [ossLid.substitution.invalidNominal]:
    'Ошибка {from} -> {to}: подстановка номиноида возможна только вместо другого номиноида',
  [ossLid.substitution.invalidClasses]: 'Ошибка {from} -> {to}: классы конституент не совпадают',
  [ossLid.substitution.typificationCycle]: 'Ошибка: цикл подстановок в типизациях {detail}',
  [ossLid.substitution.baseSubstitutionNotSet]:
    'Ошибка: типизация не задает множество {from} ∈ {to}',
  [ossLid.substitution.unequalTypification]:
    'Ошибка {from} -> {to}: типизация структурных операндов не совпадает',
  [ossLid.substitution.unequalArgsCount]: 'Ошибка {from} -> {to}: количество аргументов не совпадает',
  [ossLid.substitution.unequalArgs]: 'Ошибка {from} -> {to}: типизация аргументов не совпадает',
  [ossLid.substitution.unequalExpressions]:
    'Предупреждение {from} -> {to}: определения понятий не совпадают',
  [ossLid.fallback.unknownOperationType]: 'UNKNOWN OPERATION TYPE: {type}',
  [ossLid.fallback.unknownSubstitutionError]: 'UNKNOWN ERROR',

  [rsmodelLid.eval.noEval]: 'Без вычисления',
  [rsmodelLid.eval.notProcessed]: 'Не вычислено',
  [rsmodelLid.eval.invalidData]: 'Неверные данные',
  [rsmodelLid.eval.evalFail]: 'Ошибка',
  [rsmodelLid.eval.axiomFalse]: 'Нарушена аксиома',
  [rsmodelLid.eval.empty]: 'Пустое значение',
  [rsmodelLid.eval.hasData]: 'ОК',
  [rsmodelLid.evalDesc.noEval]: 'вычисление не требуется',
  [rsmodelLid.evalDesc.notProcessed]: 'вычисление не проводилось',
  [rsmodelLid.evalDesc.invalidData]: 'данные не соответствуют типу',
  [rsmodelLid.evalDesc.evalFail]: 'ошибка при вычислении',
  [rsmodelLid.evalDesc.axiomFalse]: 'значение аксиомы ложно',
  [rsmodelLid.evalDesc.empty]: 'значение равно пустому множеству',
  [rsmodelLid.evalDesc.hasData]: 'значение вычислено и не пусто',
  [rsmodelLid.value.na]: 'N/A',
  [rsmodelLid.value.logicTrue]: 'Истина',
  [rsmodelLid.value.logicFalse]: 'Ложь',
  [rsmodelLid.value.singleton]: '1',
  [rsmodelLid.value.tupleMarker]: 'C',
  [rsmodelLid.valueDesc.cardinalityPrefix]: 'Мощность: {n} | {stub}',
  [rsmodelLid.fallback.unknownEvalStatus]: 'UNKNOWN EVALUATION STATUS: {status}',

  [usersLid.role.reader]: 'Читатель',
  [usersLid.role.editor]: 'Редактор',
  [usersLid.role.owner]: 'Владелец',
  [usersLid.role.admin]: 'Администратор',
  [usersLid.roleDesc.reader]: 'Режим читателя',
  [usersLid.roleDesc.editor]: 'Режим редактирования',
  [usersLid.roleDesc.owner]: 'Режим владельца',
  [usersLid.roleDesc.admin]: 'Режим администратора',
  [usersLid.fallback.unknownRole]: 'UNKNOWN USER ROLE: {role}',

  [aiLid.variable.block]: 'Текущий блок операционной схемы',
  [aiLid.variable.oss]: 'Текущая операционная схема',
  [aiLid.variable.schema]: 'Текущая концептуальная схема',
  [aiLid.variable.schemaThesaurus]: 'Термины и определения текущей концептуальной схемы',
  [aiLid.variable.schemaGraph]: 'Граф связей определений конституент',
  [aiLid.variable.schemaTypeGraph]: 'Граф ступеней концептуальной схемы',
  [aiLid.variable.constituenta]: 'Текущая конституента',
  [aiLid.variable.constituentaSyntaxTree]: 'Синтаксическое дерево конституенты',
  [aiLid.variableMock.block]: 'Пример: Текущий блок операционной схемы',
  [aiLid.variableMock.oss]: 'Пример: Текущая операционная схема',
  [aiLid.variableMock.schema]: 'Пример: Текущая концептуальная схема',
  [aiLid.variableMock.schemaThesaurus]:
    'Пример\nТермин1 - Определение1\nТермин2 - Определение2',
  [aiLid.variableMock.schemaGraph]: 'Пример: Граф связей определений конституент',
  [aiLid.variableMock.schemaTypeGraph]: 'Пример: Граф ступеней концептуальной схемы',
  [aiLid.variableMock.constituenta]: 'Пример: Текущая конституента',
  [aiLid.variableMock.constituentaSyntaxTree]: 'Пример синтаксического дерева конституенты',
  [aiLid.fallback.unknownVariableType]: 'UNKNOWN VARIABLE TYPE: {type}',
  [aiLid.fallback.unknownVariable]: 'UNKNOWN VARIABLE: {name}',

  [cctextLid.grammemeUnknown]: 'Неизв: {gram}',
  ...Object.fromEntries(grammemeRuEntries),

  [rslangLid.type.logicName]: 'Logic',
  [rslangLid.typeClass.logic]: 'Логический',
  [rslangLid.typeClass.typification]: 'Теоретико-множественный',
  [rslangLid.typeClass.function]: 'Терм-функция',
  [rslangLid.typeClass.predicate]: 'Предикат-функция',
  [rslangLid.misc.notDefined]: 'не определено',
  [rslangLid.fallback.unknownRSError]: 'UNKNOWN ERROR',
  [rslangLid.fallback.unknownNode]: 'UNKNOWN {id}',
  [rslangLid.fallback.noTokenLabel]: 'no label: {id}',

  [rslangLid.error[RSErrorCode.unknownSyntax]]: 'Неопределенная синтаксическая ошибка',
  [rslangLid.error[RSErrorCode.missingParenthesis]]: "Пропущена ')'",
  [rslangLid.error[RSErrorCode.missingCurlyBrace]]: "Пропущена '}'",
  [rslangLid.error[RSErrorCode.missingSquareBracket]]: "Пропущена ']'",
  [rslangLid.error[RSErrorCode.bracketMismatch]]:
    "Несогласованные скобки: '{open}' вместо '{close}'",
  [rslangLid.error[RSErrorCode.doubleParenthesis]]:
    "Двойные обрамляющие скобки '((' и '))' не допускаются",
  [rslangLid.error[RSErrorCode.missingOpenBracket]]: "Пропущена открывающая скобка '{bracket}'",
  [rslangLid.error[RSErrorCode.expectedLocal]]: 'Ожидалось имя переменной',
  [rslangLid.error[RSErrorCode.expectedType]]: 'Ожидался тип: {type}',
  [rslangLid.error[RSErrorCode.localDoubleDeclare]]: 'Повторное объявление: {name}',
  [rslangLid.error[RSErrorCode.localNotUsed]]: 'Неиспользованная переменная: {name}',
  [rslangLid.error[RSErrorCode.localUndeclared]]: 'Необъявленная переменная: {name}',
  [rslangLid.error[RSErrorCode.localShadowing]]: 'Повторное объявление переменной: {name}',
  [rslangLid.error[RSErrorCode.typesNotEqual]]: 'Типизации не совпадают: {a} ≠ {b}',
  [rslangLid.error[RSErrorCode.globalNotTyped]]: 'Нет типизации: {name}',
  [rslangLid.error[RSErrorCode.invalidDecart]]:
    'τ(α×b) = 𝔅(𝔇τ(α)×𝔇τ(b)). Некорректный аргумент: {arg}',
  [rslangLid.error[RSErrorCode.invalidBoolean]]:
    'τ(ℬ(a)) = 𝔅𝔅𝔇τ(a). Некорректный аргумент: {arg}',
  [rslangLid.error[RSErrorCode.invalidTypeOperation]]: 'Аргумент операции должен быть множеством: {arg}',
  [rslangLid.error[RSErrorCode.invalidCard]]: 'Мощность только для множеств: {arg}',
  [rslangLid.error[RSErrorCode.invalidDebool]]:
    'τ(debool(a)) = 𝔇τ(a). Некорректный аргумент: {arg}',
  [rslangLid.error[RSErrorCode.globalFuncWithoutArgs]]: 'Функция без аргументов: {name}',
  [rslangLid.error[RSErrorCode.invalidReduce]]:
    'τ(red(a)) = 𝔅𝔇𝔇τ(a). Некорректный аргумент: {arg}',
  [rslangLid.error[RSErrorCode.invalidProjectionTuple]]:
    'Проекция только для кортежа: {from} -> {to}',
  [rslangLid.error[RSErrorCode.invalidProjectionSet]]:
    'τ(Pri(a)) = 𝔅𝒞i𝔇τ(a). Некорректный аргумент: {from} -> {to}',
  [rslangLid.error[RSErrorCode.invalidEnumeration]]:
    'Типизация элементов не совпадает: {a} ≠ {b}',
  [rslangLid.error[RSErrorCode.invalidCortegeDeclare]]:
    'Количество переменных в кортеже не соответствует размерности декартова произведения',
  [rslangLid.error[RSErrorCode.localOutOfScope]]:
    'Переменная _{name}_ вне границ своего определения',
  [rslangLid.error[RSErrorCode.invalidElementPredicate]]:
    'Несоответствие типизаций: {a}{b}{c}',
  [rslangLid.error[RSErrorCode.invalidEmptySetUsage]]: 'Бессмысленное использование пустого множества',
  [rslangLid.error[RSErrorCode.invalidArgsArity]]: 'Неверное число аргументов: {a} ≠ {b}',
  [rslangLid.error[RSErrorCode.invalidArgumentType]]:
    'Типизация аргумента не соответствует объявленной: {expected} != {actual}',
  [rslangLid.error[RSErrorCode.globalStructure]]:
    'Область определения родовой структуры не корректна',
  [rslangLid.error[RSErrorCode.radicalUsage]]: 'Радикалы запрещены вне деклараций: {name}',
  [rslangLid.error[RSErrorCode.invalidFilterArgumentType]]:
    'Типизация аргумента фильтра не корректна: {a}({b})',
  [rslangLid.error[RSErrorCode.invalidFilterArity]]:
    'Количество параметров фильтра не соответствует количеству индексов',
  [rslangLid.error[RSErrorCode.arithmeticNotSupported]]: 'Тип не поддерживает арифметику: {type}',
  [rslangLid.error[RSErrorCode.typesNotCompatible]]:
    'Типы не совместимы для выбранной операции: {a} и {b}',
  [rslangLid.error[RSErrorCode.orderingNotSupported]]:
    'Тип не поддерживает предикаты порядка: {type}',
  [rslangLid.error[RSErrorCode.globalNoValue]]: 'Невычислимый идентификатор: {name}',
  [rslangLid.error[RSErrorCode.invalidPropertyUsage]]: 'Неитерируемое множество в качестве значения',
  [rslangLid.error[RSErrorCode.cstEmptyDerived]]:
    'Пустое выражение для сложного понятия или утверждения',
  [rslangLid.error[RSErrorCode.definitionNotAllowed]]: 'Определение не допускается для выбранного типа',
  [rslangLid.error[RSErrorCode.calcUnknownError]]: 'Неизвестная ошибка вычисления',
  [rslangLid.error[RSErrorCode.calculationNotSupported]]:
    'Объявление функции не предполагает вычисления',
  [rslangLid.error[RSErrorCode.setOverflow]]: 'Превышен лимит количества элементов: {limit}',
  [rslangLid.error[RSErrorCode.booleanBaseLimit]]: 'Превышен лимит для основания булеана: {limit}',
  [rslangLid.error[RSErrorCode.calcGlobalMissing]]: 'Нет значения: {name}',
  [rslangLid.error[RSErrorCode.iterationsLimit]]: 'Превышен лимит итераций {limit}',
  [rslangLid.error[RSErrorCode.calcInvalidDebool]]: 'Некорректное взятие debool',
  [rslangLid.error[RSErrorCode.iterateInfinity]]: 'Итерация по бесконечности'
};
