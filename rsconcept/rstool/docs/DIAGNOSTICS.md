# Диагностика

Читай, когда `analyzeExpression` или `addOrUpdateConstituenta` вернули `diagnostics`.

## `DiagnosticRecord`

- `code` — числовой `RSErrorCode`.
- `params` — аргументы сообщения.
- `from`, `to` — диапазон в `definitionFormal`.
- `constituentId` — есть в диагностике сессии из `listDiagnostics`.

Источник истины: `@rsconcept/domain/src/rslang/error.ts`. Для короткого вида UI/логов используй `getRSErrorPrefix(code)`.

## Классы кодов

- `0x8400` — parser: синтаксис и скобки.
- `0x8800` — semantic: типизации, области видимости, структура.
- `0x8100` — runtime/evaluation: вычисление модели.
- `0x2800` — warning: обычно не блокирует выражение.
- `0x88Cx` — правила схемы и `cstType`.

## Частые parser-коды

- `0x8400 unknownSyntax` — неопределенная синтаксическая ошибка.
- `0x8406 missingParenthesis` — не закрыты `(` `)`.
- `0x8407 missingCurlyBrace` — не закрыты `{` `}`.
- `0x8408 missingSquareBracket` — не закрыты `[` `]`.
- `0x8409 bracketMismatch` — смешаны типы скобок.
- `0x840A doubleParenthesis` — лишняя пара скобок.
- `0x840B missingOpenBracket` — закрывающая скобка без открывающей.
- `0x8415 expectedLocal` — нужна локальная переменная.
- `0x8416 expectedType` — нужна явная ступень.

## Локальные переменные

- `0x8801 localUndeclared` — свяжи переменную квантором или параметром.
- `0x8802 localShadowing` — переименуй внутреннюю переменную.
- `0x8815 localOutOfScope` — перенеси использование внутрь области видимости.
- `0x2801 localDoubleDeclare` — warning; объявление задублировано.
- `0x2802 localNotUsed` — warning; переменная не используется.

## Типизации и структура

- `0x8803 typesNotEqual` / `0x8825 typesNotCompatible` — операнды несовместимы.
- `0x8804 globalNotTyped` — сначала добавь и проанализируй поставщика.
- `0x8805 invalidDecart`, `0x8806 invalidBoolean`, `0x8810 invalidReduce` — неверная ступень для операции.
- `0x8808 invalidCard` — `card(...)` не над множеством.
- `0x8809 invalidDebool` — нет гарантии синглетона.
- `0x880B globalFuncWithoutArgs` — функция вызвана без `[]`.
- `0x8811 invalidProjectionTuple`, `0x8812 invalidProjectionSet` — неверная проекция.
- `0x8813 invalidEnumeration` — элементы перечисления разных ступеней.
- `0x8816 invalidElementPredicate` — `ξ ∈ S` с несовместимыми ступенями.
- `0x8818 invalidArgsArity`, `0x8819 invalidArgumentType` — неверный вызов функции.
- `0x8821 radicalUsage` — радикал вне домена параметра.
- `0x8822 invalidFilterArgumentType`, `0x8823 invalidFilterArity` — неверный `Fi`.
- `0x8824 arithmeticNotSupported`, `0x8826 orderingNotSupported` — нужна ступень `Z`.
- `0x8827 expectedLogic` — нужна логическая формула.
- `0x8828 expectedSetexpr` — нужно теоретико-множественное выражение, а не логика.

## Схема и вычисление

- `0x8861 cstEmptyDerived` — у выводимой конституенты пустая формула.
- `0x8862 definitionNotAllowed` — у `basic`/`constant` непустая формула.
- `0x8840 globalNoValue` / `0x8103 calcGlobalMissing` — нет значения в модели.
- `0x8841 invalidPropertyUsage` — `Property` использован как вычислимое значение.
- `0x8101 setOverflow`, `0x8102 booleanBaseLimit`, `0x8104 iterationsLimit` — выражение слишком дорого вычислять.
- `0x8100 calcUnknownError` — непредвиденная ошибка вычисления (неверные данные для операции, внутренний сбой).
- `0x8105 calcInvalidDebool` — `debool` получил не синглетон.
- `0x8106 iterateInfinity`, `0x8107 calculationNotSupported` — конструкция не исполнима в конечной модели.
- `0x8108 calcInvalidData` — несовместимые значения в runtime (`params`: строковые представления операндов); типично сравнение множества с числом или смешение ступеней в данных модели. Диапазон `from`/`to` — узел операции, где сбой произошёл.

## Типичные ошибки агентов

- Задавать значение `term`/`axiom`/`statement` напрямую.
- Писать формулу у `basic` или `constant`.
- Добавлять потребителя раньше поставщика.
- Давать логическое тело `term` или нелогическое тело `axiom`/`statement`.
- Использовать `R#` в теле результата.
- Вычислять производные понятия до привязки данных для базовых.
- Сравнивать или комбинировать значения несовместимых ступеней в модели (ожидай `0x8108 calcInvalidData`).

## Цикл исправления

Пошаговый цикл — в `../skills/rstool-helper/GUIDE.md`, раздел «Цикл диагностик». Здесь — справочник кодов и типичных ошибок.
