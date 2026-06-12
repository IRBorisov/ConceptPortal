# RSLang и rstool — справочник

## Контракт rstool

- Пакет: `@rsconcept/rstool`
- Версия контракта: `1.4.0` (`CONTRACT_VERSION`)
- Основной класс: `RSToolAgent`
- Публичные импорты: `@rsconcept/rstool` и `@rsconcept/rstool/wrapper`

### Методы

| Метод                                                       | Назначение                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `createSession(initial?)`                                   | Новая in-memory сессия → `{ sessionId, contractVersion }`                     |
| `addOrUpdateConstituenta(sessionId, { draft })`             | Слияние черновика; анализ в контексте сессии → `{ state, diagnostics }`       |
| `analyzeExpression(sessionId, { expression, cstType })`     | Разбор/типизация фрагмента без сохранения конституенты                        |
| `getFormState(sessionId)`                                   | Клон полного состояния сессии                                                 |
| `listDiagnostics(sessionId, filters?)`                      | Накопленные диагностики; опциональный фильтр `constituentId`                  |
| `commitStep(sessionId, message?)`                           | Зафиксировать контрольную точку ревизии                                       |
| `exportSession(sessionId)`                                  | JSON-строка `{ contractVersion, state, diagnostics }`                         |
| `exportPortalSchema(sessionId)`                             | JSON импорта схемы Portal                                                     |
| `exportPortalModel(sessionId)`                              | JSON импорта модели Portal                                                    |
| `importSession(payload)`                                    | Новая сессия из экспорта                                                      |
| `setConstituentaValue(sessionId, { target, type?, value })` | Одна привязка базового понятия или структурное значение → `SessionModelState` |
| `setConstituentaValues(sessionId, { items })`               | Пакетная установка значений → `SessionModelState`                             |
| `clearConstituentaValues(sessionId, { items })`             | Очистка значений по id конституент → `SessionModelState`                      |
| `getModelState(sessionId)`                                  | Клон состояния интерпретации сессии                                           |
| `evaluateExpression(sessionId, { expression, cstType })`    | Вычисление фрагмента в контексте сессии → `EvaluationResult`                  |
| `evaluateConstituenta(sessionId, { constituentId })`        | Вычисление сохранённого определения → `EvaluationResult`                      |
| `recalculateModel(sessionId)`                               | Пересчёт всех выводимых конституент → `{ items[] }`                           |

### `ConstituentaDraft`

```ts
{
  id: number;           // стабильный id внутри сессии
  alias: string;
  cstType: CstType;
  definitionFormal: string;
  term?: string;
  definitionText?: string;
  convention?: string;
}
```

Пропущенные текстовые поля в сохранённом состоянии по умолчанию `''`.

### Метаданные `SessionState`

Задаются в `createSession(initial?)` или через `importSession`:

```ts
{
  alias: string; // alias объекта библиотеки
  title: string; // отображаемое название
  comment: string; // заметки разработчика
}
```

При опускании все поля по умолчанию `''`.

### Типы модели и вычисления

```ts
type RSToolValue = number | RSToolValue[]; // значение во время выполнения
type BasicBinding = Record<number, string>; // подписи элементов базового множества

interface SessionModelState {
  items: { id: number; type: string; value: RSToolValue | BasicBinding }[];
}

interface EvaluationResult {
  success: boolean;
  value: RSToolValue | BasicBinding | null;
  status: EvalStatus; // 1=NO_EVAL … 7=HAS_DATA
  iterations: number;
  cacheHits: number;
  diagnostics: { code: number; from: number; to: number; params?: string[] }[];
}
```

Привязки `basic`/`constant` используют `type: "basic"` и `value: { "0": "label", … }`. Структурные значения — нормализованная типизация в `type` и вложенные массивы для множеств/кортежей.

### Протокол stdio

Процесс: `npx rstool-wrapper`

1. **Ready** (без запроса): `{"id":null,"ok":true,"result":{"ready":true,"wrapper":"rstool-stdio","contractVersion":"1.4.0"}}`
2. **Запрос**: `{"id":"<unique>","method":"<name>","params":{...}}`
3. **Ответ**: `{"id":"<same>","ok":true,"result":...}` или `{"id":"...","ok":false,"error":{"code":"...","message":"..."}}`

Дополнительные методы: `ping`, `methods`.

Пример цепочки:

```json
{"id":"1","method":"createSession","params":{}}
{"id":"2","method":"addOrUpdateConstituenta","params":{"sessionId":"…","input":{"draft":{"id":2,"alias":"S1","cstType":"structure","definitionFormal":"ℬ(X1×X1)"}}}}
{"id":"2b","method":"addOrUpdateConstituenta","params":{"sessionId":"…","input":{"draft":{"id":3,"alias":"D1","cstType":"term","definitionFormal":"Pr1(S1)"}}}}
{"id":"3","method":"analyzeExpression","params":{"sessionId":"…","input":{"expression":"1+2","cstType":"term"}}}
{"id":"4","method":"listDiagnostics","params":{"sessionId":"…"}}
{"id":"5","method":"commitStep","params":{"sessionId":"…","message":"checkpoint"}}
{"id":"6","method":"exportSession","params":{"sessionId":"…"}}
{"id":"6a","method":"exportPortalSchema","params":{"sessionId":"…"}}
{"id":"6b","method":"exportPortalModel","params":{"sessionId":"…"}}
{"id":"7","method":"setConstituentaValue","params":{"sessionId":"…","input":{"target":1,"value":{"0":"a","1":"b"}}}}
{"id":"8","method":"evaluateExpression","params":{"sessionId":"…","input":{"expression":"1+2","cstType":"term"}}}
{"id":"9","method":"evaluateConstituenta","params":{"sessionId":"…","input":{"constituentId":3}}}
```

`RSToolWrapperClient`: по умолчанию запускает `rstool-wrapper`; методы `waitUntilReady()`, `call(method, params)`, `close()`.

### Результат анализа

```ts
interface AnalysisResult {
  success: boolean;
  type: Record<string, unknown> | null;
  valueClass: 'value' | 'property' | null;
  diagnostics: { code: number; from: number; to: number; params?: string[] }[];
}
```

## RSLang

Кратко: язык на базе логики первого порядка; разделение множественных и логических выражений; параметризованные шаблоны для функций и предикатов.

- **Типизация**: структурный тип выражения; ступени включают элементы (`Xi`, `Ci`), `Z`, кортежи `(H1×…×Hn)`, множества `ℬ(H)`, логику `Logic`, параметризованные `Hr 🠔 [H1,…,Hi]`. У `structure` (`S#`) поле `definitionFormal` **задаёт** типизацию. У `term` (`D#`) типизация **выводится** из определения.

## Токены грамматики

Из `rslang.grammar`:

| Категория           | Токены / формы                                          |
| ------------------- | ------------------------------------------------------- |
| Глобальные          | `X`, `C`, `S`, `D`, `A`, `T` + цифры (правило `Global`) |
| Функции / предикаты | `F<n>`, `P<n>`                                          |
| Радикалы            | `R<n>`                                                  |
| Локальные           | `_a-zα-ω` + опциональные цифры                          |
| Логика              | `¬` `∀` `∃` `⇔` `⇒` `∨` `&`                             |
| Множества           | `ℬ` `∪` `\` `∆` `∩` `×` `∈` `∉` `⊆` `⊂` …               |
| Операции            | `Pr`, `pr`, `Fi`, `card`, `bool`, `debool`, `red`       |
| Литералы            | цифры, `Z`, `∅`                                         |

Полная грамматика и приоритеты: `docs/GRAMMAR-REF.md`.

## Документация

| Тема                                     | Документ                                                     |
| ---------------------------------------- | ------------------------------------------------------------ |
| Идентификаторы, литералы                 | `docs/SYNTAX.md` § «Имена и литералы»                        |
| Ступени, `Logic`, параметризованные типы | `docs/TYPIFICATION.md` § «Ступени»                           |
| Логические выражения                     | `docs/SYNTAX.md` § «Логические выражения (LE)»               |
| Операторы над множествами                | `docs/SYNTAX.md` § «Теоретико-множественные выражения (STE)» |
| Целочисленная арифметика                 | `docs/SYNTAX.md` § «Арифметика»                              |
| Дополнительные и производные типизации   | `docs/TYPIFICATION.md` § «Дополнительные типизации»          |
| Кванторы                                 | `docs/SYNTAX.md` § «Кванторы»                                |
| Параметризованные функции, шаблоны       | `docs/SYNTAX.md` § «Параметризованные выражения»             |
| Модель корректности / валидация          | `docs/SYNTAX.md` § «Корректность»                            |
| Семантические тесты определений          | `docs/MODEL-TESTING.md`                                      |
| Словарь предметной области               | `docs/DOMAIN.md`                                             |
| Поля конституент и порядок               | `docs/CONSTITUENTA.md`                                       |
| REST API Portal                          | `docs/PORTAL-API.md`                                         |
| Токены грамматики / приоритеты           | `docs/GRAMMAR-REF.md`                                        |

Воркфлоу и чеклисты — `skills/rstool-helper/GUIDE.md`.

## Коды ошибок

Категории и исправления по коду: `docs/DIAGNOSTICS.md`.

Категории:

- `0x84xx` — синтаксис / разбор
- `0x28xx` — предупреждения локальных объявлений
- `0x88xx` — семантика / типы
- `0x886x` — уровень конституент (пустая производная, запрещённое определение)
- `0x81xx` — вычисление (runtime; из `evaluateExpression` / `evaluateConstituenta`)

## Форма экспорта сессии

`exportSession(sessionId)` возвращает JSON-строку `{ contractVersion, state, diagnostics }`.

- `state.alias`, `state.title`, `state.comment` — метаданные объекта библиотеки для экспорта в Portal (`comment` → JSON `description`).
- `state.items[]` — каждая конституента с `id`, `alias`, `cstType`, `definitionFormal`, опциональными текстовыми полями и вложенным результатом анализа.
- `state.model.items[]` — присутствует, если заданы значения интерпретации.
- `diagnostics[]` — накопленные диагностики со смещениями и кодами.

`importSession(payload)` принимает только этот формат `exportSession`. JSON Portal из
`GET /api/rsforms/:id/details` сначала переноси в сессию через `createSession` и
`addOrUpdateConstituenta`; поля и REST-пути описаны в `docs/PORTAL-API.md`.

## JSON импорта Portal

Для **Load from JSON** на существующей схеме или модели Portal:

- `exportPortalSchema(sessionId)` — файл схемы
- `exportPortalModel(sessionId)` — файл модели

- Схема `items[]`: поля конституент (`cst_type`, `definition_formal`, `term_raw`, …).
- Модель `items[]`: `{ id, type, value }` на каждую привязку.
