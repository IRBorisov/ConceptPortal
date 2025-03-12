import { HelpTopic } from './models/help-topic';

/**
 * Retrieves label for {@link HelpTopic}.
 */
export function labelHelpTopic(topic: HelpTopic): string {
  // prettier-ignore
  switch (topic) {
    case HelpTopic.MAIN: return '🏠 Портал';

    case HelpTopic.THESAURUS: return '📖 Тезаурус';

    case HelpTopic.INTERFACE: return '🌀 Интерфейс';
    case HelpTopic.UI_LIBRARY: return 'Библиотека';
    case HelpTopic.UI_RS_MENU: return 'Меню схемы';
    case HelpTopic.UI_RS_CARD: return 'Карточка схемы';
    case HelpTopic.UI_RS_LIST: return 'Список конституент';
    case HelpTopic.UI_RS_EDITOR: return 'Редактор конституенты';
    case HelpTopic.UI_GRAPH_TERM: return 'Граф термов';
    case HelpTopic.UI_FORMULA_TREE: return 'Дерево разбора';
    case HelpTopic.UI_TYPE_GRAPH: return 'Граф ступеней';
    case HelpTopic.UI_CST_STATUS: return 'Статус конституенты';
    case HelpTopic.UI_CST_CLASS: return 'Класс конституенты';
    case HelpTopic.UI_OSS_GRAPH: return 'Граф синтеза';
    case HelpTopic.UI_SUBSTITUTIONS: return 'Отождествления';
    case HelpTopic.UI_RELOCATE_CST: return 'Перенос конституент';

    case HelpTopic.CONCEPTUAL: return '♨️ Концептуализация';
    case HelpTopic.CC_SYSTEM: return 'Система определений';
    case HelpTopic.CC_CONSTITUENTA: return 'Конституента';
    case HelpTopic.CC_RELATIONS: return 'Связи понятий';
    case HelpTopic.CC_SYNTHESIS: return 'Синтез схем';
    case HelpTopic.CC_OSS: return 'Операционная схема';
    case HelpTopic.CC_PROPAGATION: return 'Сквозные изменения';

    case HelpTopic.RSLANG: return '🚀 Экспликация';
    case HelpTopic.RSL_TYPES: return 'Типизация';
    case HelpTopic.RSL_CORRECT: return 'Переносимость';
    case HelpTopic.RSL_INTERPRET: return 'Интерпретируемость';
    case HelpTopic.RSL_OPERATIONS: return 'Операции';
    case HelpTopic.RSL_TEMPLATES: return 'Банк выражений';

    case HelpTopic.TERM_CONTROL: return '🪸 Терминологизация';
    case HelpTopic.ACCESS: return '🔐 Доступы';
    case HelpTopic.VERSIONS: return '🏺 Версионирование';

    case HelpTopic.INFO: return '📰 Информация';
    case HelpTopic.INFO_RULES: return 'Правила';
    case HelpTopic.INFO_CONTRIB: return 'Разработчики';
    case HelpTopic.INFO_PRIVACY: return 'Обработка данных';
    case HelpTopic.INFO_API: return 'REST API';

    case HelpTopic.EXTEOR: return '🖥️ Экстеор';
  }
}

/**
 * Retrieves description for {@link HelpTopic}.
 */
export function describeHelpTopic(topic: HelpTopic): string {
  // prettier-ignore
  switch (topic) {
    case HelpTopic.MAIN: return 'общая справка по порталу';

    case HelpTopic.THESAURUS: return 'термины Портала';

    case HelpTopic.INTERFACE: return 'описание интерфейса пользователя';
    case HelpTopic.UI_LIBRARY: return 'поиск и просмотр схем';
    case HelpTopic.UI_RS_MENU: return 'меню редактирования схемы';
    case HelpTopic.UI_RS_CARD: return 'общие атрибуты схемы';
    case HelpTopic.UI_RS_LIST: return 'концептуальная схема <br/>в форме таблицы';
    case HelpTopic.UI_RS_EDITOR: return 'редактирование конституенты';
    case HelpTopic.UI_GRAPH_TERM: return 'интерфейс графа термов';
    case HelpTopic.UI_FORMULA_TREE: return 'просмотр дерева разбора <br/>родоструктурного выражения';
    case HelpTopic.UI_TYPE_GRAPH: return 'просмотр графа ступеней';
    case HelpTopic.UI_CST_STATUS: return 'нотация статуса конституенты';
    case HelpTopic.UI_CST_CLASS: return 'нотация класса конституенты';
    case HelpTopic.UI_OSS_GRAPH: return 'графическая форма <br/>операционной схемы синтеза';
    case HelpTopic.UI_SUBSTITUTIONS: return 'таблица отождествлений конституент';
    case HelpTopic.UI_RELOCATE_CST: return 'перенос конституент<br/>в рамках ОСС';

    case HelpTopic.CONCEPTUAL: return 'основы концептуализации';
    case HelpTopic.CC_SYSTEM: return 'концептуальная схема <br/>как система понятий';
    case HelpTopic.CC_CONSTITUENTA: return 'понятия конституенты и ее атрибутов';
    case HelpTopic.CC_RELATIONS: return 'отношения между конституентами';
    case HelpTopic.CC_SYNTHESIS: return 'операция синтеза концептуальных схем';
    case HelpTopic.CC_OSS: return 'операционная схема синтеза';
    case HelpTopic.CC_PROPAGATION: return 'сквозные изменения в ОСС';

    case HelpTopic.RSLANG: return 'экспликация и язык родов структур';
    case HelpTopic.RSL_TYPES: return 'система типов в <br/>родоструктурной экспликации';
    case HelpTopic.RSL_CORRECT: return 'биективная переносимость';
    case HelpTopic.RSL_INTERPRET: return 'интерпретация определений <br/>и утверждений';
    case HelpTopic.RSL_OPERATIONS: return 'формальные операции';
    case HelpTopic.RSL_TEMPLATES: return 'применение Банка выражений';

    case HelpTopic.TERM_CONTROL: return 'контроль терминов и текстовых отсылок';
    case HelpTopic.ACCESS: return 'организация доступов к схемам';
    case HelpTopic.VERSIONS: return 'справка по управлению версиями схем';

    case HelpTopic.INFO: return 'справочные, нормативные <br/>и технические документы';
    case HelpTopic.INFO_RULES: return 'правила пользования Порталом';
    case HelpTopic.INFO_CONTRIB: return 'признание вклада <br/>в создание Портала';
    case HelpTopic.INFO_PRIVACY: return 'политика обработки <br/>персональных данных';
    case HelpTopic.INFO_API: return 'интерфейс для разработчиков';

    case HelpTopic.EXTEOR: return 'программа экспликации теорий <br/>"Экстеор" для Windows';
  }
}
