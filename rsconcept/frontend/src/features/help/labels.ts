import { HelpTopic } from './models/help-topic';

const labelHelpTopicRecord: Record<HelpTopic, string> = {
  [HelpTopic.MAIN]: '🏠 Портал',

  [HelpTopic.THESAURUS]: '📖 Тезаурус',

  [HelpTopic.INTERFACE]: '🌀 Интерфейс',
  [HelpTopic.UI_LIBRARY]: 'Библиотека',
  [HelpTopic.UI_SCHEMA_MENU]: 'Меню схемы',
  [HelpTopic.UI_SCHEMA_CARD]: 'Паспорт схемы',
  [HelpTopic.UI_SCHEMA_LIST]: 'Список схемы',
  [HelpTopic.UI_SCHEMA_EDITOR]: 'Редактор конституенты',
  [HelpTopic.UI_STRUCTURE_PLANNER]: 'Порождение структуры',
  [HelpTopic.UI_MODEL_MENU]: 'Меню модели',
  [HelpTopic.UI_MODEL_CARD]: 'Паспорт модели',
  [HelpTopic.UI_MODEL_LIST]: 'Список модели',
  [HelpTopic.UI_MODEL_VALUE]: 'Данные модели',
  [HelpTopic.UI_MODEL_VALUE_EDIT]: 'Диалог значения',
  [HelpTopic.UI_MODEL_EVALUATOR]: 'Расчет выражения',
  [HelpTopic.UI_EVAL_STATUS]: 'Статусы вычисления',
  [HelpTopic.UI_MODEL_BINDING]: 'Базовый источник',
  [HelpTopic.UI_GRAPH_TERM]: 'Граф термов',
  [HelpTopic.UI_FORMULA_TREE]: 'Дерево разбора',
  [HelpTopic.UI_TYPE_GRAPH]: 'Граф ступеней',
  [HelpTopic.UI_CST_STATUS]: 'Статус конституенты',
  [HelpTopic.UI_CST_CLASS]: 'Класс конституенты',
  [HelpTopic.UI_OSS_CARD]: 'Паспорт ОСС',
  [HelpTopic.UI_OSS_GRAPH]: 'Операционная схема',
  [HelpTopic.UI_OSS_SIDEBAR]: 'Боковая панель',
  [HelpTopic.UI_SUBSTITUTIONS]: 'Отождествления',
  [HelpTopic.UI_RELOCATE_CST]: 'Перенос конституент',

  [HelpTopic.CONCEPTUAL]: '♨️ Концептуализация',
  [HelpTopic.CC_SYSTEM]: 'Система определений',
  [HelpTopic.CC_RSMODEL]: 'Концептуальная модель',
  [HelpTopic.CC_CONSTITUENTA]: 'Конституента',
  [HelpTopic.CC_RELATIONS]: 'Связи понятий',
  [HelpTopic.CC_SYNTHESIS]: 'Синтез схем',
  [HelpTopic.CC_STRUCTURING]: 'Структурирование',
  [HelpTopic.CC_OSS]: 'Операционная схема',
  [HelpTopic.CC_PROPAGATION]: 'Сквозные изменения',

  [HelpTopic.RSLANG]: '🚀 Экспликация',
  [HelpTopic.RSL_LITERALS]: 'Идентификаторы',
  [HelpTopic.RSL_TYPIFICATION]: 'Типизация',
  [HelpTopic.RSL_EXPRESSION_LOGIC]: 'Логические выражения',
  [HelpTopic.RSL_EXPRESSION_SET]: 'Операции с множествами',
  [HelpTopic.RSL_EXPRESSION_STRUCTURE]: 'Структурные выражения',
  [HelpTopic.RSL_EXPRESSION_ARITHMETIC]: 'Арифметика',
  [HelpTopic.RSL_EXPRESSION_QUANTOR]: 'Кванторные конструкции',
  [HelpTopic.RSL_EXPRESSION_DECLARATIVE]: 'Декларативные',
  [HelpTopic.RSL_EXPRESSION_IMPERATIVE]: 'Императивные',
  [HelpTopic.RSL_EXPRESSION_RECURSIVE]: 'Рекурсивные',
  [HelpTopic.RSL_EXPRESSION_PARAMETER]: 'Параметризованные',
  [HelpTopic.RSL_CORRECT]: 'Переносимость',
  [HelpTopic.RSL_INTERPRET]: 'Интерпретируемость',
  [HelpTopic.RSL_OPERATIONS]: 'Операции',
  [HelpTopic.RSL_TEMPLATES]: 'Банк выражений',

  [HelpTopic.TERM_CONTROL]: '🪸 Терминологизация',
  [HelpTopic.ACCESS]: '🔐 Доступы',
  [HelpTopic.VERSIONS]: '🏺 Версионирование',
  [HelpTopic.ASSISTANT]: '🤖 ИИ-помощник',

  [HelpTopic.INFO]: '📰 Информация',
  [HelpTopic.INFO_RULES]: 'Правила',
  [HelpTopic.INFO_CONTRIB]: 'Разработчики',
  [HelpTopic.INFO_PRIVACY]: 'Обработка данных',
  [HelpTopic.INFO_API]: 'REST API',

  [HelpTopic.EXTEOR]: '🖥️ Экстеор'
};

const describeHelpTopicRecord: Record<HelpTopic, string> = {
  [HelpTopic.MAIN]: 'общая справка по порталу',

  [HelpTopic.THESAURUS]: 'термины Портала',

  [HelpTopic.INTERFACE]: 'описание интерфейса пользователя',
  [HelpTopic.UI_LIBRARY]: 'поиск и просмотр схем',
  [HelpTopic.UI_SCHEMA_MENU]: 'меню редактирования схемы',
  [HelpTopic.UI_SCHEMA_CARD]: 'общие атрибуты схемы',
  [HelpTopic.UI_SCHEMA_LIST]: 'концептуальная схема <br/>в форме таблицы',
  [HelpTopic.UI_SCHEMA_EDITOR]: 'редактирование конституенты',
  [HelpTopic.UI_STRUCTURE_PLANNER]: 'управление терминами,<br/>связанными со структурой типизации',
  [HelpTopic.UI_MODEL_MENU]: 'меню редактирования модели',
  [HelpTopic.UI_MODEL_CARD]: 'атрибуты модели и связь со схемой',
  [HelpTopic.UI_MODEL_LIST]: 'табличная работа с составом модели',
  [HelpTopic.UI_MODEL_VALUE]: 'ввод, просмотр и редактирование значений модели',
  [HelpTopic.UI_MODEL_VALUE_EDIT]: 'структурный просмотр и редактирование отдельного значения',
  [HelpTopic.UI_MODEL_EVALUATOR]: 'проверка и вычисление произвольных выражений',
  [HelpTopic.UI_EVAL_STATUS]: 'обозначения состояний вычисления',
  [HelpTopic.UI_MODEL_BINDING]: 'редактирование значений базисного множества',
  [HelpTopic.UI_GRAPH_TERM]: 'интерфейс графа термов',
  [HelpTopic.UI_FORMULA_TREE]: 'просмотр дерева разбора <br/>родоструктурного выражения',
  [HelpTopic.UI_TYPE_GRAPH]: 'просмотр графа ступеней',
  [HelpTopic.UI_CST_STATUS]: 'нотация статуса конституенты',
  [HelpTopic.UI_CST_CLASS]: 'нотация класса конституенты',
  [HelpTopic.UI_OSS_CARD]: 'общие атрибуты ОСС,<br/>доступ и статистика операций',
  [HelpTopic.UI_OSS_GRAPH]: 'графическая форма <br/>операционной схемы синтеза',
  [HelpTopic.UI_OSS_SIDEBAR]: 'боковая панель для редактирования содержания выбранной операции',
  [HelpTopic.UI_SUBSTITUTIONS]: 'таблица отождествлений конституент',
  [HelpTopic.UI_RELOCATE_CST]: 'перенос конституент<br/>в рамках ОСС',

  [HelpTopic.CONCEPTUAL]: 'теоретические основы',
  [HelpTopic.CC_SYSTEM]: 'концептуальная схема <br/>как система понятий',
  [HelpTopic.CC_RSMODEL]: 'интерпретированная <br/>система определений',
  [HelpTopic.CC_CONSTITUENTA]: 'понятия конституенты и ее атрибутов',
  [HelpTopic.CC_RELATIONS]: 'отношения между конституентами',
  [HelpTopic.CC_SYNTHESIS]: 'операция синтеза концептуальных схем',
  [HelpTopic.CC_STRUCTURING]: 'структурирование предметной области',
  [HelpTopic.CC_OSS]: 'операционная схема синтеза',
  [HelpTopic.CC_PROPAGATION]: 'сквозные изменения в ОСС',

  [HelpTopic.RSLANG]: 'язык родов структур и его применение',
  [HelpTopic.RSL_LITERALS]: 'обозначения конституент,<br/>локальных переменных и литералов',
  [HelpTopic.RSL_TYPIFICATION]: 'система типов в <br/>родоструктурной экспликации',
  [HelpTopic.RSL_EXPRESSION_LOGIC]: 'логические связывающие конструкции',
  [HelpTopic.RSL_EXPRESSION_SET]: 'операции с множествами',
  [HelpTopic.RSL_EXPRESSION_STRUCTURE]: 'операции со ступенями',
  [HelpTopic.RSL_EXPRESSION_ARITHMETIC]: 'арифметические выражения',
  [HelpTopic.RSL_EXPRESSION_QUANTOR]: 'кванторные конструкции',
  [HelpTopic.RSL_EXPRESSION_DECLARATIVE]: 'декларативные выражения',
  [HelpTopic.RSL_EXPRESSION_IMPERATIVE]: 'императивные выражения',
  [HelpTopic.RSL_EXPRESSION_RECURSIVE]: 'рекурсивные выражения',
  [HelpTopic.RSL_EXPRESSION_PARAMETER]: 'выражения с внешними параметрами',
  [HelpTopic.RSL_CORRECT]: 'биективная переносимость',
  [HelpTopic.RSL_INTERPRET]: 'интерпретация определений <br/>и утверждений',
  [HelpTopic.RSL_OPERATIONS]: 'формальные операции',
  [HelpTopic.RSL_TEMPLATES]: 'применение Банка выражений',

  [HelpTopic.TERM_CONTROL]: 'контроль терминов и текстовых отсылок',
  [HelpTopic.ACCESS]: 'организация доступов к схемам',
  [HelpTopic.VERSIONS]: 'справка по управлению версиями схем',
  [HelpTopic.ASSISTANT]: 'функционал ИИ-помощника',

  [HelpTopic.INFO]: 'справочные, нормативные <br/>и технические документы',
  [HelpTopic.INFO_RULES]: 'правила пользования Порталом',
  [HelpTopic.INFO_CONTRIB]: 'признание вклада <br/>в создание Портала',
  [HelpTopic.INFO_PRIVACY]: 'политика обработки <br/>персональных данных',
  [HelpTopic.INFO_API]: 'интерфейс для разработчиков',

  [HelpTopic.EXTEOR]: 'программа экспликации теорий <br/>"Экстеор" для Windows'
};

/** Retrieves label for {@link HelpTopic}. */
export function labelHelpTopic(topic: HelpTopic): string {
  return labelHelpTopicRecord[topic] ?? 'UNKNOWN TOPIC';
}

/** Retrieves description for {@link HelpTopic}. */
export function describeHelpTopic(topic: HelpTopic): string {
  return describeHelpTopicRecord[topic] ?? 'UNKNOWN TOPIC';
}
