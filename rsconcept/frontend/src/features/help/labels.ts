import { HelpTopic } from './models/help-topic';

const labelHelpTopicRecord: Record<HelpTopic, string> = {
  [HelpTopic.MAIN]: '🏠 Портал',

  [HelpTopic.THESAURUS]: '📖 Тезаурус',

  [HelpTopic.INTERFACE]: '🌀 Интерфейс',
  [HelpTopic.UI_LIBRARY]: 'Библиотека',
  [HelpTopic.UI_RS_MENU]: 'Меню схемы',
  [HelpTopic.UI_RS_CARD]: 'Паспорт схемы',
  [HelpTopic.UI_RS_LIST]: 'Список конституент',
  [HelpTopic.UI_RS_EDITOR]: 'Редактор конституенты',
  [HelpTopic.UI_GRAPH_TERM]: 'Граф термов',
  [HelpTopic.UI_FORMULA_TREE]: 'Дерево разбора',
  [HelpTopic.UI_TYPE_GRAPH]: 'Граф ступеней',
  [HelpTopic.UI_CST_STATUS]: 'Статус конституенты',
  [HelpTopic.UI_CST_CLASS]: 'Класс конституенты',
  [HelpTopic.UI_OSS_GRAPH]: 'Операционная схема',
  [HelpTopic.UI_OSS_SIDEBAR]: 'Боковая панель',
  [HelpTopic.UI_SUBSTITUTIONS]: 'Отождествления',
  [HelpTopic.UI_RELOCATE_CST]: 'Перенос конституент',

  [HelpTopic.CONCEPTUAL]: '♨️ Концептуализация',
  [HelpTopic.CC_SYSTEM]: 'Система определений',
  [HelpTopic.CC_CONSTITUENTA]: 'Конституента',
  [HelpTopic.CC_RELATIONS]: 'Связи понятий',
  [HelpTopic.CC_SYNTHESIS]: 'Синтез схем',
  [HelpTopic.CC_STRUCTURING]: 'Структурирование',
  [HelpTopic.CC_OSS]: 'Операционная схема',
  [HelpTopic.CC_PROPAGATION]: 'Сквозные изменения',

  [HelpTopic.RSLANG]: '🚀 Экспликация',
  [HelpTopic.RSL_TYPES]: 'Типизация',
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
  [HelpTopic.UI_RS_MENU]: 'меню редактирования схемы',
  [HelpTopic.UI_RS_CARD]: 'общие атрибуты схемы',
  [HelpTopic.UI_RS_LIST]: 'концептуальная схема <br/>в форме таблицы',
  [HelpTopic.UI_RS_EDITOR]: 'редактирование конституенты',
  [HelpTopic.UI_GRAPH_TERM]: 'интерфейс графа термов',
  [HelpTopic.UI_FORMULA_TREE]: 'просмотр дерева разбора <br/>родоструктурного выражения',
  [HelpTopic.UI_TYPE_GRAPH]: 'просмотр графа ступеней',
  [HelpTopic.UI_CST_STATUS]: 'нотация статуса конституенты',
  [HelpTopic.UI_CST_CLASS]: 'нотация класса конституенты',
  [HelpTopic.UI_OSS_GRAPH]: 'графическая форма <br/>операционной схемы синтеза',
  [HelpTopic.UI_OSS_SIDEBAR]: 'боковая панель для редактирования содержания выбранной операции',
  [HelpTopic.UI_SUBSTITUTIONS]: 'таблица отождествлений конституент',
  [HelpTopic.UI_RELOCATE_CST]: 'перенос конституент<br/>в рамках ОСС',

  [HelpTopic.CONCEPTUAL]: 'основы концептуализации',
  [HelpTopic.CC_SYSTEM]: 'концептуальная схема <br/>как система понятий',
  [HelpTopic.CC_CONSTITUENTA]: 'понятия конституенты и ее атрибутов',
  [HelpTopic.CC_RELATIONS]: 'отношения между конституентами',
  [HelpTopic.CC_SYNTHESIS]: 'операция синтеза концептуальных схем',
  [HelpTopic.CC_STRUCTURING]: 'структурирование предметной области',
  [HelpTopic.CC_OSS]: 'операционная схема синтеза',
  [HelpTopic.CC_PROPAGATION]: 'сквозные изменения в ОСС',

  [HelpTopic.RSLANG]: 'экспликация и язык родов структур',
  [HelpTopic.RSL_TYPES]: 'система типов в <br/>родоструктурной экспликации',
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
