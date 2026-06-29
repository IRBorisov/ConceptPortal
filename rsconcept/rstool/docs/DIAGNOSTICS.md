# Диагностика

Читай, когда `analyzeExpression`, `addOrUpdateConstituenta`, `listDiagnostics` или `evaluate*`
вернули диагностику. Источник истины по кодам — `@rsconcept/domain/src/rslang/error.ts`.

## Где лежит диагностика

У rstool два представления одной и той же ошибки.

- **Плоское** `RSToolErrorDescription` — в `AnalysisResult.diagnostics` (из `analyzeExpression`
  и `addOrUpdateConstituenta(...).analysis`) и в `EvaluationResult.diagnostics`:
  - `code` — числовой `RSErrorCode`.
  - `from`, `to` — полуинтервал `[from, to)` в `definitionFormal` (или в выражении вычисления).
  - `params?` — позиционный массив строк-аргументов сообщения (см. таблицы ниже).
- **Обёрнутое** `DiagnosticRecord` — только из `listDiagnostics`:
  - `sessionId`, `expression` — исходное выражение.
  - `error` — то же `RSToolErrorDescription` (`code`/`from`/`to`/`params`) **вложено**, читай `record.error.code`.
  - `constituentId?` — id конституенты. У диагностик от `addOrUpdateConstituenta` он есть;
    у черновиков `analyzeExpression` он `undefined`. Фильтруй `listDiagnostics(sessionId, { constituentId })`.

## Класс и префикс кода

Класс выводится по битовым маскам кода (порядок проверки важен — см. `inferErrorClass`):

| Маска    | Класс      | Префикс `getRSErrorPrefix` |
| :------- | :--------- | :------------------------- |
| `0x0100` | EVALUATION | `E` + hex                  |
| `0x0200` | LEXER      | `L` + hex                  |
| `0x0400` | PARSER     | `P` + hex                  |
| `0x0800` | SEMANTIC   | `S` + hex                  |
| иначе    | UNKNOWN    | `U` + hex                  |

- Диапазоны: `0x84xx` — parser (синтаксис, скобки), `0x88xx` — semantic (типизация, область
  видимости, структура, схема, отсутствие значения), `0x81xx` — evaluation (вычисление КМ),
  `0x28xx` — предупреждения (класс UNKNOWN, префикс `U`).

## Parser (`0x84xx`, префикс `P`)

| Код      | Имя                   | `params`             | Исправление                                                                      |
| :------- | :-------------------- | :------------------- | :------------------------------------------------------------------------------- |
| `0x8400` | `unknownSyntax`       | —                    | Неопределённая синтаксическая ошибка: проверь операторы, скобки, идентификаторы. |
| `0x8409` | `bracketMismatch`     | `[expected, actual]` | Закрой ожидаемой скобкой `expected` вместо `actual`.                             |
| `0x840A` | `doubleParenthesis`   | —                    | Убери лишнюю внешнюю пару `(( … ))`.                                             |
| `0x840B` | `missingOpenBracket`  | `[bracket]`          | Непарная закрывающая `bracket`: убери её или добавь открывающую.                 |
| `0x840C` | `missingCloseBracket` | `[bracket]`          | Непарная открывающая `bracket`: убери её или добавь закрывающую.                 |
| `0x8415` | `expectedLocal`       | —                    | Ожидалось имя локальной переменной.                                              |
| `0x8416` | `expectedType`        | —                    | Тип выражения не соответствует `cstType` конституенты.                           |
| `0x8417` | `invalidFilterSyntax` | —                    | Синтаксис `Fi`: `Fi1[D1](S1)`, `Fi1,2[D1,D2](S1)` или `Fi1,2[D3](S1)`.           |

## Предупреждения (`0x28xx`, префикс `U`, не блокируют)

| Код      | Имя                  | `params` | Исправление                                                            |
| :------- | :------------------- | :------- | :--------------------------------------------------------------------- |
| `0x2801` | `localDoubleDeclare` | `[name]` | Объявление `name` задублировано — можно игнорировать или убрать дубль. |
| `0x2802` | `localNotUsed`       | `[name]` | Переменная `name` не используется.                                     |

## Локальные переменные и область видимости (`0x88xx`, префикс `S`)

| Код      | Имя               | `params` | Исправление                                                |
| :------- | :---------------- | :------- | :--------------------------------------------------------- |
| `0x8801` | `localUndeclared` | `[name]` | Свяжи `name` квантором или объяви параметром.              |
| `0x8802` | `localShadowing`  | `[name]` | Переименуй внутреннюю переменную `name`.                   |
| `0x8815` | `localOutOfScope` | `[name]` | Перенеси использование `name` внутрь её области видимости. |

## Типизация и структура (`0x88xx`, префикс `S`)

| Код      | Имя                             | `params`             | Исправление                                                                                                                  |
| :------- | :------------------------------ | :------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `0x8803` | `typesNotEqual`                 | `[a, b, operator]`   | Операнды `operator` должны иметь равный тип (`a` ≠ `b`).                                                                     |
| `0x8825` | `typesNotCompatible`            | `[a, b, operator]`   | Типы `a` и `b` несовместимы для `operator`.                                                                                  |
| `0x8804` | `globalNotTyped`                | `[name]`             | Поставщик `name` не типизирован: добавь и проанализируй его раньше.                                                          |
| `0x8805` | `invalidDecart`                 | `[arg]`              | Аргумент `arg` оператора `×` неподходящей ступени.                                                                           |
| `0x8806` | `invalidBoolean`                | `[arg]`              | Аргумент `arg` оператора `ℬ()` неподходящей ступени.                                                                         |
| `0x8810` | `invalidReduce`                 | `[arg]`              | `red(arg)` требует ступень `ℬℬ`.                                                                                             |
| `0x8807` | `invalidTypeOperation`          | `[operator, type]`   | Аргумент `type` оператора `operator` (`∪`, `∈`, `D{}`, `:∈` и т.п.) должен быть множеством.                                  |
| `0x8808` | `invalidCard`                   | `[arg]`              | `card(arg)` только над множеством.                                                                                           |
| `0x8809` | `invalidDebool`                 | `[arg]`              | `debool(arg)` требует ступень-множество с гарантией синглетона.                                                              |
| `0x880B` | `globalFuncWithoutArgs`         | `[name]`             | Терм-/предикат-функция `name` вызвана без аргументов: нужен `F#[…]` / `P#[…]`.                                               |
| `0x8811` | `invalidProjectionTuple`        | `[from, to]`         | Проекция `Pr` только над кортежем.                                                                                           |
| `0x8812` | `invalidProjectionSet`          | `[projection, type]` | Неверная проекция `projection` над типом `type`.                                                                             |
| `0x8813` | `invalidEnumeration`            | `[a, b]`             | Элементы перечисления разной типизации (`a` ≠ `b`).                                                                          |
| `0x8814` | `invalidCortegeDeclare`         | —                    | Число переменных кортежа ≠ размерности `×` (напр. `∀(a,b)∈X1`).                                                              |
| `0x8816` | `invalidElementPredicate`       | `[a, operator, c]`   | `a operator c` (`ξ∈S`) с несовместимыми ступенями: `a` — тип элемента, `c` — тип множества.                                  |
| `0x8817` | `invalidEmptySetUsage`          | —                    | Бессмысленное использование `∅` (напр. `X1∪∅`).                                                                              |
| `0x8818` | `invalidArgsArity`              | `[expected, actual]` | Неверное число аргументов функции (`expected` ≠ `actual`).                                                                   |
| `0x8819` | `invalidArgumentType`           | `[expected, actual]` | Тип аргумента не соответствует объявлению: ожидалось `expected`, получено `actual`.                                          |
| `0x881C` | `globalStructure`               | —                    | Некорректный домен родовой структуры (`cstType` STRUCTURED): нужна ступень-структура вроде `ℬ(X1×D2)`, а не, напр., `X1∩X1`. |
| `0x8821` | `radicalUsage`                  | `[name]`             | Радикал `name` допустим только внутри аргумента функции.                                                                     |
| `0x8824` | `arithmeticNotSupported`        | `[type, operator]`   | `type` не поддерживает арифметику `operator`: нужна ступень `Z` или `C#`.                                                    |
| `0x8826` | `orderingNotSupported`          | `[type, operator]`   | `type` не поддерживает порядок `operator`: нужна ступень `Z` или `C#`.                                                       |
| `0x8827` | `expectedLogic`                 | `[type]`             | Нужна логическая формула, получен тип `type`.                                                                                |
| `0x8828` | `expectedSetexpr`               | `[type]`             | Нужно теоретико-множественное выражение, получен тип `type` (напр. `Logic`).                                                 |
| `0x8829` | `invalidArgumentCortegeDeclare` | —                    | Связное объявление кортежа запрещено в аргументах функции (`[(a,b)∈S1]`): используй проекции или раздельные переменные.      |
| `0x882A` | `invalidQuantifierDomain`       | `[operator, type]`   | Область квантора `operator` (`∀`/`∃`) должна быть множеством, а не `type`.                                                   |

## Фильтр `Fi` (`0x882x`, префикс `S`)

| Код      | Имя                           | `params`                             | Исправление                                                                           |
| :------- | :---------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------ |
| `0x8822` | `invalidFilterArgumentType`   | `[operator, actual, expected]`       | Аргумент `Fi` имеет тип `actual`, ожидался `expected` (обычно `ℬ(…)`).                |
| `0x8823` | `invalidFilterArity`          | `[indexCount, paramCount, operator]` | Число индексов `indexCount` ≠ числу параметров `paramCount` у `operator`.             |
| `0x882B` | `invalidFilterParameterType`  | `[param, expected, operator]`        | Тип параметра `param` не совпадает с компонентом аргумента `expected` для `operator`. |
| `0x882C` | `invalidFilterIndex`          | `[operator, actual, index, arity]`   | Индекс проекции `index` превышает арность кортежа `arity` аргумента `actual`.         |
| `0x882D` | `invalidFilterBooleanEchelon` | `[operator, actual, expected]`       | У параметра `Fi` недостаёт ступени ℬ: тип `actual`, `bool(actual)` дал бы `expected`. |

## Значение и схема (`0x88xx`, префикс `S`)

| Код      | Имя                    | `params` | Исправление                                                  |
| :------- | :--------------------- | :------- | :----------------------------------------------------------- |
| `0x8840` | `globalNoValue`        | `[name]` | Идентификатор `name` невычислим в модели.                    |
| `0x8841` | `invalidPropertyUsage` | —        | `Property` - множество использовано как вычислимое значение. |
| `0x8861` | `cstEmptyDerived`      | —        | У выводимой конституенты пустая формула.                     |
| `0x8862` | `definitionNotAllowed` | —        | У `basic`/`constant` определение не допускается.             |

## Вычисление КМ (`0x81xx`, префикс `E`)

| Код      | Имя                       | `params`           | Исправление                                                            |
| :------- | :------------------------ | :----------------- | :--------------------------------------------------------------------- |
| `0x8100` | `calcUnknownError`        | —                  | Непредвиденная ошибка вычисления.                                      |
| `0x8101` | `setOverflow`             | `[limit]`          | Превышен предел числа элементов `limit`: упрости выражение или данные. |
| `0x8102` | `booleanBaseLimit`        | `[limit]`          | Превышен предел базы степенного множества `limit`.                     |
| `0x8103` | `calcGlobalMissing`       | `[name]`           | Нет значения для `name`: задай `setConstituentaValue(s)`.              |
| `0x8104` | `iterationsLimit`         | `[limit]`          | Превышен предел итераций `limit`.                                      |
| `0x8105` | `calcInvalidDebool`       | —                  | `debool` получил не синглетон.                                         |
| `0x8106` | `iterateInfinity`         | —                  | Итерация по бесконечному множеству.                                    |
| `0x8107` | `calculationNotSupported` | —                  | Объявление функции не подразумевает вычисления.                        |
| `0x8108` | `calcInvalidData`         | `[a, b, operator]` | Несовместимые значения `a` и `b` для `operator` в runtime.             |

## Цикл исправления

Пошаговый цикл — в `../skills/rstool-helper/GUIDE.md`, раздел «Цикл диагностик». Здесь — справочник кодов.
