/**
 * Module: Text descriptors for UI and model elements.
 * 
 * Label is a short text used to represent an entity.
 * Description is a long description used in tooltips.
 */
import { GramData,Grammeme, ReferenceType } from '../models/language';
import { CstMatchMode, DependencyMode, HelpTopic, LibraryFilterStrategy } from '../models/miscelanious';
import { CstClass, CstType, ExpressionStatus, IConstituenta } from '../models/rsform';
import { IArgumentInfo, IRSErrorDescription, ISyntaxTreeNode, ParsingStatus, RSErrorType, TokenID } from '../models/rslang';

/**
 * Generates desription for {@link IConstituenta}.
 */
export function describeConstituenta(cst: IConstituenta): string {
  if (cst.cst_type === CstType.STRUCTURED) {
    return (
      cst.term_resolved || cst.term_raw ||
      cst.definition_resolved || cst.definition_raw ||
      cst.convention ||
      cst.definition_formal
    );
  } else {
    return (
      cst.term_resolved || cst.term_raw ||
      cst.definition_resolved || cst.definition_raw ||
      cst.definition_formal ||
      cst.convention
    );
  }
}

/**
 * Generates desription for term of a given {@link IConstituenta}.
 */
export function describeConstituentaTerm(cst?: IConstituenta): string {
  if (!cst) {
    return '!Конституента отсутствует!';
  }
  if (!cst.term_resolved) {
    return '!Пустой термин!';
  } else {
    return cst.term_resolved;
  }
}

/**
 * Generates label for {@link IConstituenta}.
 */
export function labelConstituenta(cst: IConstituenta) {
  return `${cst.alias}: ${describeConstituenta(cst)}`;
}

/**
 * Retrieves label for {@link TokenID}.
 */
export function labelToken(id: TokenID): string {
  switch (id) {
  case TokenID.BOOLEAN:       return 'ℬ()';
  case TokenID.DECART:        return '×';
  case TokenID.PUNC_PL:       return '( )';
  case TokenID.PUNC_SL:       return '[ ]';
  case TokenID.FORALL:        return '∀';
  case TokenID.EXISTS:        return '∃';
  case TokenID.NOT:           return '¬';
  case TokenID.AND:           return '&';
  case TokenID.OR:            return '∨';
  case TokenID.IMPLICATION:   return '⇒';
  case TokenID.EQUIVALENT:    return '⇔';
  case TokenID.LIT_EMPTYSET:  return '∅';
  case TokenID.LIT_INTSET:    return 'Z';
  case TokenID.EQUAL:         return '=';
  case TokenID.NOTEQUAL:      return '≠';
  case TokenID.GREATER_OR_EQ: return '≥';
  case TokenID.LESSER_OR_EQ:  return '≤';
  case TokenID.IN:            return '∈';
  case TokenID.NOTIN:         return '∉';
  case TokenID.SUBSET_OR_EQ:  return '⊆';
  case TokenID.SUBSET:        return '⊂';
  case TokenID.NOTSUBSET:     return '⊄';
  case TokenID.INTERSECTION:  return '∩';
  case TokenID.UNION:         return '∪';
  case TokenID.SET_MINUS:     return '\\';
  case TokenID.SYMMINUS:      return '∆';
  case TokenID.NT_DECLARATIVE_EXPR:   return 'D{}';
  case TokenID.NT_IMPERATIVE_EXPR:    return 'I{}';
  case TokenID.NT_RECURSIVE_FULL:     return 'R{}';
  case TokenID.BIGPR:         return 'Pr1()';
  case TokenID.SMALLPR:       return 'pr1()';
  case TokenID.FILTER:        return 'Fi1[]()';
  case TokenID.REDUCE:        return 'red()';
  case TokenID.CARD:          return 'card()';
  case TokenID.BOOL:          return 'bool()';
  case TokenID.DEBOOL:        return 'debool()';
  case TokenID.PUNC_ASSIGN:   return ':=';
  case TokenID.PUNC_ITERATE:  return ':∈';
  }
  return `no label: ${id}`;
}

export function describeToken(id: TokenID): string {
  switch (id) {
  case TokenID.BOOLEAN:         return 'Булеан [Alt + E / Shift + B]';
  case TokenID.DECART:          return 'Декартово произведение [Alt + Shift + E / Shift + 8]';
  case TokenID.PUNC_PL:         return 'Скобки вокруг выражения [Alt + Shift + 9 ]';
  case TokenID.PUNC_SL:         return 'Скобки вокруг выражения [Alt + [ ]';
  case TokenID.FORALL:          return 'Квантор всеобщности [`]';
  case TokenID.EXISTS:          return 'Квантор существования [Shift + `]';
  case TokenID.NOT:             return 'Отрицание [Alt + `]';
  case TokenID.AND:             return 'Конъюнкция [Alt + 3 ~ Shift + 7]';
  case TokenID.OR:              return 'Дизъюнкция [Alt + Shift + 3]';
  case TokenID.IMPLICATION:     return 'Импликация [Alt + 4]';
  case TokenID.EQUIVALENT:      return 'Эквивалентность [Alt + Shift + 4]';
  case TokenID.LIT_EMPTYSET:    return 'Пустое множество [Alt + X]';
  case TokenID.LIT_INTSET:      return 'Целые числа [Alt + Z]';
  case TokenID.EQUAL:           return 'Равенство';
  case TokenID.NOTEQUAL:        return 'Неравенство [Alt + Shift + `]';
  case TokenID.GREATER_OR_EQ:   return 'Больше или равно [Alt + Shift + 7]';
  case TokenID.LESSER_OR_EQ:    return 'Меньше или равно [Alt + Shift + 8]';
  case TokenID.IN:              return 'Быть элементом (принадлежит) [Alt + 1]';
  case TokenID.NOTIN:           return 'Не принадлежит [Alt + Shift + 1]';
  case TokenID.SUBSET_OR_EQ:    return 'Быть частью (нестрогое подмножество) [Alt + 2]';
  case TokenID.SUBSET:          return 'Строгое подмножество [Alt + 7]';
  case TokenID.NOTSUBSET:       return 'Не подмножество [Alt + Shift + 2]';
  case TokenID.INTERSECTION:    return 'Пересечение [Alt + A]';
  case TokenID.UNION:           return 'Объединение [Alt + S]';
  case TokenID.SET_MINUS:       return 'Разность множеств [Alt + 5]';
  case TokenID.SYMMINUS:        return 'Симметрическая разность [Alt + Shift + 5]';
  case TokenID.NT_DECLARATIVE_EXPR: return 'Декларативная форма определения терма [Alt + D]';
  case TokenID.NT_IMPERATIVE_EXPR: return 'Императивная форма определения терма [Alt + G]';
  case TokenID.NT_RECURSIVE_FULL: return 'Рекурсивная (цикличная) форма определения терма [Alt + T]';
  case TokenID.BIGPR:           return 'Большая проекция [Alt + Q]';
  case TokenID.SMALLPR:         return 'Малая проекция [Alt + W]';
  case TokenID.FILTER:          return 'Фильтр [Alt + F]';
  case TokenID.REDUCE:          return 'Множество-сумма [Alt + R]';
  case TokenID.CARD:            return 'Мощность [Alt + C]';
  case TokenID.BOOL:            return 'Синглетон [Alt + B]';
  case TokenID.DEBOOL:          return 'Десинглетон [Alt + V]';
  case TokenID.PUNC_ASSIGN:     return 'Присвоение (императивный синтаксис) [Alt + Shift + 6]';
  case TokenID.PUNC_ITERATE:    return 'Перебор элементов множества (императивный синтаксис) [Alt + 6]';
  }
  return `no description: ${id}`;
}

/**
 * Retrieves label for {@link CstMatchMode}.
 */
export function labelCstMathchMode(mode: CstMatchMode): string {
  switch (mode) {
    case CstMatchMode.ALL:  return 'общий';
    case CstMatchMode.EXPR: return 'выражение';
    case CstMatchMode.TERM: return 'термин';
    case CstMatchMode.TEXT: return 'текст';
    case CstMatchMode.NAME: return 'имя';
  }
}

/**
 * Retrieves description for {@link CstMatchMode}.
 */
export function describeCstMathchMode(mode: CstMatchMode): string {
  switch (mode) {
    case CstMatchMode.ALL:  return 'искать во всех атрибутах';
    case CstMatchMode.EXPR: return 'искать в формальных выражениях';
    case CstMatchMode.TERM: return 'искать в терминах';
    case CstMatchMode.TEXT: return 'искать в определениях и конвенциях';
    case CstMatchMode.NAME: return 'искать в идентификаторах конституент';
  }
}

/**
 * Retrieves label for {@link DependencyMode}.
 */
export function labelCstSource(mode: DependencyMode): string {
  switch (mode) {
    case DependencyMode.ALL:            return 'не ограничен';
    case DependencyMode.EXPRESSION:     return 'выражение';
    case DependencyMode.OUTPUTS:        return 'потребители';
    case DependencyMode.INPUTS:         return 'поставщики';
    case DependencyMode.EXPAND_OUTPUTS: return 'зависимые';
    case DependencyMode.EXPAND_INPUTS:  return 'влияющие';
  }
}

/**
 * Retrieves description for {@link DependencyMode}.
 */
export function describeCstSource(mode: DependencyMode): string {
  switch (mode) {
    case DependencyMode.ALL:            return 'все конституенты';
    case DependencyMode.EXPRESSION:     return 'идентификаторы из выражения';
    case DependencyMode.OUTPUTS:        return 'прямые ссылки на текущую';
    case DependencyMode.INPUTS:         return 'пярмые ссылки из текущей';
    case DependencyMode.EXPAND_OUTPUTS: return 'опосредованные ссылки на текущую';
    case DependencyMode.EXPAND_INPUTS:  return 'опосредованные ссылки из текущей';
  }
}

/**
 * Retrieves label for {@link LibraryFilterStrategy}.
 */
export function labelLibraryFilter(strategy: LibraryFilterStrategy): string {
  switch (strategy) {
    case LibraryFilterStrategy.MANUAL:      return 'отображать все';
    case LibraryFilterStrategy.COMMON:      return 'общедоступные';
    case LibraryFilterStrategy.CANONICAL:   return 'неизменные';
    case LibraryFilterStrategy.PERSONAL:    return 'личные';
    case LibraryFilterStrategy.SUBSCRIBE:   return 'подписки';
    case LibraryFilterStrategy.OWNED:       return 'владелец';
  }
}

/**
 * Retrieves description for {@link LibraryFilterStrategy}.
 */
export function describeLibraryFilter(strategy: LibraryFilterStrategy): string {
  switch (strategy) {
    case LibraryFilterStrategy.MANUAL:      return 'Отображать все схемы';
    case LibraryFilterStrategy.COMMON:      return 'Отображать общедоступные схемы';
    case LibraryFilterStrategy.CANONICAL:   return 'Отображать стандартные схемы';
    case LibraryFilterStrategy.PERSONAL:    return 'Отображать подписки и владеемые схемы';
    case LibraryFilterStrategy.SUBSCRIBE:   return 'Отображать подписки';
    case LibraryFilterStrategy.OWNED:       return 'Отображать владеемые схемы';
  }
}

/**
 * Retrieves label for graph layout mode.
 */
export const mapLableLayout: Map<string, string> = 
new Map([
  ['forceatlas2', 'Граф: Атлас 2D'],
  ['forceDirected2d', 'Граф: Силы 2D'],
  ['forceDirected3d', 'Граф: Силы 3D'],
  ['treeTd2d', 'Граф: ДеревоВерт 2D'],
  ['treeTd3d', 'Граф: ДеревоВерт 3D'],
  ['treeLr2d', 'Граф: ДеревоГор 2D'],
  ['treeLr3d', 'Граф: ДеревоГор 3D'],
  ['radialOut2d', 'Граф: Радиальная 2D'],
  ['radialOut3d', 'Граф: Радиальная 3D'],
  ['circular2d', 'Граф: Круговая'],
  ['hierarchicalTd', 'Граф: ИерархияВерт'],
  ['hierarchicalLr', 'Граф: ИерархияГор'],
  ['nooverlap', 'Граф: Без перекрытия']
]);

/**
 * Retrieves label for graph coloring mode.
 */
export const mapLabelColoring: Map<string, string> = 
new Map([
  ['none', 'Цвет: моно'],
  ['status', 'Цвет: статус'],
  ['type', 'Цвет: класс'],
]);

/**
 * Retrieves label for {@link ExpressionStatus}.
 */
export function labelExpressionStatus(status: ExpressionStatus): string {
  switch (status) {
    case ExpressionStatus.VERIFIED:     return 'корректно';
    case ExpressionStatus.INCORRECT:    return 'ошибка';
    case ExpressionStatus.INCALCULABLE: return 'невычислимо';
    case ExpressionStatus.PROPERTY:     return 'неразмерное';
    case ExpressionStatus.UNKNOWN:      return 'непроверено';
    case ExpressionStatus.UNDEFINED:    return 'N/A';
  }
}

/**
 * Retrieves description for {@link ExpressionStatus}.
 */
export function describeExpressionStatus(status: ExpressionStatus): string {
  switch (status) {
    case ExpressionStatus.VERIFIED:     return 'выражение корректно и вычислимо';
    case ExpressionStatus.INCORRECT:    return 'ошибка в выражении';
    case ExpressionStatus.INCALCULABLE: return 'нельзя использовать для вычисления интерпретации';
    case ExpressionStatus.PROPERTY:     return 'только для проверки принадлежности';
    case ExpressionStatus.UNKNOWN:      return 'требует проверки выражения';
    case ExpressionStatus.UNDEFINED:    return 'произошла ошибка при проверке выражения';
  }
}

/**
 * Retrieves label for {@link HelpTopic}.
 */
export function labelHelpTopic(topic: HelpTopic): string {
  switch (topic) {
    case HelpTopic.MAIN:          return 'Портал';
    case HelpTopic.LIBRARY:       return 'Библиотека';
    case HelpTopic.RSFORM:        return '- паспорт схемы';
    case HelpTopic.CSTLIST:       return '- список конституент';
    case HelpTopic.CONSTITUENTA:  return '- конституента';
    case HelpTopic.GRAPH_TERM:    return '- граф термов';
    case HelpTopic.RSTEMPLATES:   return '- Банк выражений';
    case HelpTopic.RSLANG:        return 'Экспликация';
    case HelpTopic.TERM_CONTROL:  return 'Терминологизация';
    case HelpTopic.EXTEOR:        return 'Экстеор';
    case HelpTopic.API:           return 'REST API';
  }
}

/**
 * Retrieves description for {@link HelpTopic}.
 */
export function describeHelpTopic(topic: HelpTopic): string {
  switch (topic) {
    case HelpTopic.MAIN:          return 'Общая справка по порталу';
    case HelpTopic.LIBRARY:       return 'Описание работы с библиотекой схем';
    case HelpTopic.RSFORM:        return 'Описание работы с описанием схемы';
    case HelpTopic.CSTLIST:       return 'Описание работы со списком конституентт';
    case HelpTopic.CONSTITUENTA:  return 'Описание редактирования конституенты';
    case HelpTopic.GRAPH_TERM:    return 'Описание работы с графом термов схемы';
    case HelpTopic.RSTEMPLATES:   return 'Описание работы с Банком выражений>';
    case HelpTopic.RSLANG:        return 'Справка по языку родов структур и экспликации';
    case HelpTopic.TERM_CONTROL:  return 'Справка по контролю терминов и текстовым отсылкам';
    case HelpTopic.EXTEOR:        return 'Справка по программе для экспликации "Экстеор" для Windows';
    case HelpTopic.API:           return 'Описание интерфейса для разработчиков';
  }
}

/**
 * Retrieves label for {@link CstType}.
 */
export function labelCstType(type: CstType): string {
  switch (type) {
    case CstType.BASE:          return 'Базисное множество';
    case CstType.CONSTANT:      return 'Константное множество';
    case CstType.STRUCTURED:    return 'Родовая структура';
    case CstType.AXIOM:         return 'Аксиома';
    case CstType.TERM:          return 'Терм';
    case CstType.FUNCTION:      return 'Терм-функция';
    case CstType.PREDICATE:     return 'Предикат-функция';
    case CstType.THEOREM:       return 'Теорема';
  }
}

/**
 * Retrieves label for {@link ReferenceType}.
 */
export function labelReferenceType(type: ReferenceType): string {
  switch(type) {
    case ReferenceType.ENTITY:    return 'Использование термина';
    case ReferenceType.SYNTACTIC: return 'Связывание слов';
  }
}

/**
 * Retrieves label for {@link CstClass}.
 */
export function labelCstClass(cclass: CstClass): string {
  switch (cclass) {
    case CstClass.BASIC:        return 'базовый';
    case CstClass.DERIVED:      return 'производный';
    case CstClass.STATEMENT:    return 'утверждение';
    case CstClass.TEMPLATE:     return 'шаблон';
  }
}

/**
 * Retrieves description for {@link CstClass}.
 */
export function describeCstClass(cclass: CstClass): string {
  switch (cclass) {
    case CstClass.BASIC:        return 'неопределяемое понятие, требует конвенции';
    case CstClass.DERIVED:      return 'выводимое понятие, задаваемое определением';
    case CstClass.STATEMENT:    return 'утверждение формальной логики';
    case CstClass.TEMPLATE:     return 'параметризованный шаблон определения';
  }
}

/**
 * Generates label for typification.
 */
export function labelTypification({ isValid, resultType, args }: {
  isValid: boolean;
  resultType: string;
  args: IArgumentInfo[];
}): string {
  if (!isValid) {
    return 'N/A';
  }
  if (resultType === '' || resultType === 'LOGIC') {
    resultType = 'Logical';
  }
  if (args.length === 0) {
    return resultType;
  }
  const argsText = args.map(arg => arg.typification).join(', ');
  return `${resultType} 🠔 [${argsText}]`;
}

export function labelCstTypification(cst: IConstituenta): string {
  return labelTypification({
    isValid: cst.parse.status === ParsingStatus.VERIFIED,
    resultType: cst.parse.typification,
    args: cst.parse.args
  });
}

/**
 * Generates label for {@link ISyntaxTreeNode}.
 */
export function labelSyntaxTree(node: ISyntaxTreeNode): string {
  switch (node.typeID) {
    case TokenID.ID_LOCAL:
    case TokenID.ID_GLOBAL:
    case TokenID.ID_FUNCTION:
    case TokenID.ID_PREDICATE:
    case TokenID.ID_RADICAL:
      return node.data.value as string;

    case TokenID.LIT_INTEGER: return String(node.data.value as number);

    case TokenID.BIGPR: return 'Pr' + (node.data.value as string[]).toString();
    case TokenID.SMALLPR: return 'pr' + (node.data.value as string[]).toString();
    case TokenID.FILTER: return 'Fi' + (node.data.value as string[]).toString();

    case TokenID.PLUS: return '+';
    case TokenID.MINUS: return '-';
    case TokenID.MULTIPLY: return '*';
    case TokenID.GREATER: return '>';
    case TokenID.LESSER: return '<';

    case TokenID.NT_TUPLE: return 'TUPLE';
    case TokenID.NT_ENUMERATION: return 'ENUM';

    case TokenID.NT_ENUM_DECL: return 'ENUM_DECLARATION';
    case TokenID.NT_TUPLE_DECL: return 'TUPLE_DECLARATION';
    case TokenID.PUNC_DEFINE: return 'DEFINITION';
    case TokenID.PUNC_STRUCT: return 'STRUCTURE_DEFITION';

    case TokenID.NT_ARG_DECL: return 'ARG';
    case TokenID.NT_FUNC_CALL: return 'CALL';
    case TokenID.NT_ARGUMENTS: return 'ARGS';

    case TokenID.NT_FUNC_DEFINITION: return 'FUNCTION_DEFINITION';
    case TokenID.NT_IMP_DECLARE: return 'IDECLARE';
    case TokenID.NT_IMP_ASSIGN: return 'IASSIGN';
    case TokenID.NT_IMP_LOGIC: return 'ICHECK';

    case TokenID.NT_RECURSIVE_SHORT: return labelToken(TokenID.NT_RECURSIVE_FULL);

    case TokenID.BOOLEAN:
    case TokenID.DECART:
    case TokenID.FORALL:
    case TokenID.EXISTS:
    case TokenID.NOT:
    case TokenID.AND:
    case TokenID.OR:
    case TokenID.IMPLICATION:
    case TokenID.EQUIVALENT:
    case TokenID.LIT_EMPTYSET:
    case TokenID.LIT_INTSET:
    case TokenID.EQUAL:
    case TokenID.NOTEQUAL:
    case TokenID.GREATER_OR_EQ:
    case TokenID.LESSER_OR_EQ:
    case TokenID.IN:
    case TokenID.NOTIN:
    case TokenID.SUBSET_OR_EQ:
    case TokenID.SUBSET:
    case TokenID.NOTSUBSET:
    case TokenID.INTERSECTION:
    case TokenID.UNION:
    case TokenID.SET_MINUS:
    case TokenID.SYMMINUS:
    case TokenID.NT_DECLARATIVE_EXPR:
    case TokenID.NT_IMPERATIVE_EXPR:
    case TokenID.NT_RECURSIVE_FULL:
    case TokenID.REDUCE:
    case TokenID.CARD:
    case TokenID.BOOL:
    case TokenID.DEBOOL:
    case TokenID.PUNC_ASSIGN:
    case TokenID.PUNC_ITERATE:
      return labelToken(node.typeID);
  }
  // node
  return 'UNKNOWN ' + String(node.typeID);
}

export function labelGrammeme(gram: GramData): string {
  switch (gram) {
  default: return `Неизв: ${gram}`;

  case Grammeme.NOUN: return 'ЧР: сущ';
  case Grammeme.VERB: return 'ЧР: глагол';
  case Grammeme.INFN: return 'ЧР: глагол инф';
  case Grammeme.ADJF: return 'ЧР: прил';
  case Grammeme.PRTF: return 'ЧР: прич';
  case Grammeme.ADJS: return 'ЧР: кр прил';
  case Grammeme.PRTS: return 'ЧР: кр прич';
  case Grammeme.COMP: return 'ЧР: компаратив';
  case Grammeme.GRND: return 'ЧР: деепричастие';
  case Grammeme.NUMR: return 'ЧР: число';
  case Grammeme.ADVB: return 'ЧР: наречие';
  case Grammeme.NPRO: return 'ЧР: местоимение';
  case Grammeme.PRED: return 'ЧР: предикатив';
  case Grammeme.PREP: return 'ЧР: предлог';
  case Grammeme.CONJ: return 'ЧР: союз';
  case Grammeme.PRCL: return 'ЧР: частица';
  case Grammeme.INTJ: return 'ЧР: междометие';
  case Grammeme.Abbr: return 'ЧР: аббревиатура';

  case Grammeme.sing: return 'Число: един';
  case Grammeme.plur: return 'Число: множ';

  case Grammeme.nomn: return 'Падеж: имен';
  case Grammeme.gent: return 'Падеж: род';
  case Grammeme.datv: return 'Падеж: дат';
  case Grammeme.accs: return 'Падеж: вин';
  case Grammeme.ablt: return 'Падеж: твор';
  case Grammeme.loct: return 'Падеж: пред';

  case Grammeme.masc: return 'Род: муж';
  case Grammeme.femn: return 'Род: жен';
  case Grammeme.neut: return 'Род: ср';

  case Grammeme.perf: return 'Совершенный: да';
  case Grammeme.impf: return 'Совершенный: нет';

  case Grammeme.tran: return 'Переходный: да';
  case Grammeme.intr: return 'Переходный: нет';

  case Grammeme.pres: return 'Время: наст';
  case Grammeme.past: return 'Время: прош';
  case Grammeme.futr: return 'Время: буд';

  case Grammeme.per1: return 'Лицо: 1';
  case Grammeme.per2: return 'Лицо: 2';
  case Grammeme.per3: return 'Лицо: 3';

  case Grammeme.impr: return 'Повелительный: да';
  case Grammeme.indc: return 'Повелительный: нет';

  case Grammeme.incl: return 'Включающий: да';
  case Grammeme.excl: return 'Включающий: нет';

  case Grammeme.pssv: return 'Страдательный: да';
  case Grammeme.actv: return 'Страдательный: нет';

  case Grammeme.anim: return 'Одушевленный: да';
  case Grammeme.inan: return 'Одушевленный: нет';

  case Grammeme.Infr: return 'Стиль: неформальный';
  case Grammeme.Slng: return 'Стиль: жаргон';
  case Grammeme.Arch: return 'Стиль: устаревший';
  case Grammeme.Litr: return 'Стиль: литературный';
  }
}

/**
 * Generates error description for {@link IRSErrorDescription}.
 */
export function describeRSError(error: IRSErrorDescription): string {
  switch (error.errorType) {
  case RSErrorType.unknownSymbol:
    return `Неизвестный символ: ${error.params[0]}`;
  case RSErrorType.syntax:
    return 'Неопределенная синтаксическая ошибка';
  case RSErrorType.missingParanthesis:
    return 'Некорректная конструкция языка родов структур, проверьте структуру выражения';
  case RSErrorType.missingCurlyBrace:
    return "Пропущен символ '}'";
  case RSErrorType.invalidQuantifier:
    return 'Некорректная кванторная декларация';
  case RSErrorType.expectedArgDeclaration:
    return 'Ожидалось объявление аргументов терм-функции';
  case RSErrorType.expectedLocal:
    return 'Ожидалось имя локальной переменной';

  case RSErrorType.localDoubleDeclare:
    return `Предупреждение! Повторное объявление локальной переменной ${error.params[0]}`;
  case RSErrorType.localNotUsed:
    return `Предупреждение! Переменная объявлена, но не использована: ${error.params[0]}`;
  case RSErrorType.localUndeclared:
    return `Использование необъявленной переменной: ${error.params[0]}`;
  case RSErrorType.localShadowing:
    return `Повторное объявление переменной: ${error.params[0]}`;

  case RSErrorType.typesNotEqual:
    return `Типизация операндов не совпадает! ${error.params[0]} != ${error.params[1]}`;
  case RSErrorType.globalNotTyped:
    return `Типизация конституенты не определена: ${error.params[0]}`;
  case RSErrorType.invalidDecart:
    return `τ(α×b) = ℬ(𝔇τ(α)×𝔇τ(b)). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.invalidBoolean:
    return `τ(ℬ(a)) = ℬℬ𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.invalidTypeOperation:
    return `Типизация операнда теоретико-множественной операции не корректна: ${error.params[0]}`;
  case RSErrorType.invalidCard:
    return `Некорректная типизация аргумента операции мощности: ${error.params[0]}`;
  case RSErrorType.invalidDebool:
    return `τ(debool(a)) = 𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.globalFuncMissing:
    return `Неизвестное имя функции: ${error.params[0]}`;
  case RSErrorType.globalFuncWithoutArgs:
    return `Некорректное использование имени функции без аргументов: ${error.params[0]}`;
  case RSErrorType.invalidReduce:
    return `τ(red(a)) = ℬ𝔇𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.invalidProjectionTuple:
    return `Проекция не определена: ${error.params[0]} -> ${error.params[1]}`;
  case RSErrorType.invalidProjectionSet:
    return `τ(Pri(a)) = ℬ𝒞i𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.invalidEnumeration:
    return `Типизация аргументов перечисления не совпадает: ${error.params[0]} != ${error.params[1]}`;
  case RSErrorType.ivalidBinding:
    return `Количество переменных в кортеже не соответствует размерности декартова произведения`;
  case RSErrorType.localOutOfScope:
    return `Использование имени переменной вне области действия: ${error.params[0]}`;
  case RSErrorType.invalidElementPredicat:
    return `Несоответствие типизаций операндов для оператора: ${error.params[0]}${error.params[1]}${error.params[2]}`;
  case RSErrorType.invalidArgsArtity:
    return `Неверное число аргументов терм-функции: ${error.params[0]} != ${error.params[1]}`;
  case RSErrorType.invalidArgumentType:
    return `Типизация аргумента терм-функции не соответствует объявленной: ${error.params[0]} != ${error.params[1]}`;
  case RSErrorType.invalidEqualsEmpty:
    return `Только множества можно сравнивать с пустым множеством: ${error.params[0]}`;
  case RSErrorType.globalStructure:
    return `Выражение родовой структуры должно быть ступенью`;
  case RSErrorType.globalExpectedFunction:
    return `Ожидалось выражение объявления функции`;
  case RSErrorType.emptySetUsage:
    return `Запрещено использование пустого множества как типизированного выражения`;
  case RSErrorType.radicalUsage:
    return `Радикалы запрещены вне деклараций терм-функции: ${error.params[0]}`;
  case RSErrorType.invalidFilterArgumentType:
    return `Типизация аргумента фильтра не корректна: ${error.params[0]}(${error.params[1]})`;
  case RSErrorType.invalidFilterArity:
    return `Количество параметров фильтра не соответствует количеству индексов`;
  case RSErrorType.arithmeticNotSupported:
    return `Тип не поддерживает арифметические операторы: ${error.params[0]}`;
  case RSErrorType.typesNotCompatible:
    return `Типы не совместимы для выбранной операции: ${error.params[0]} и ${error.params[1]}`;
  case RSErrorType.orderingNotSupported:
    return `Тип не поддерживает предикаты порядка: ${error.params[0]}`;
  case RSErrorType.globalNoValue:
    return `Используется неинтерпретируемый глобальный идентификатор: ${error.params[0]}`;
  case RSErrorType.invalidPropertyUsage:
    return `Использование неитерируемого множества в качестве значения`;
  case RSErrorType.globalMissingAST:
    return `Не удалось получить дерево разбора для глобального идентификатора: ${error.params[0]}`;
  case RSErrorType.globalFuncNoInterpretation:
    return `Функция не интерпретируется для данных аргументов`;
  case RSErrorType.globalNonemptyBase:
    return `Непустое выражение базисного/константного множества`;
  case RSErrorType.globalUnexpectedType:
    return `Типизация выражения не соответствует типу конституенты`;
  }
  return 'UNKNOWN ERROR';
}

