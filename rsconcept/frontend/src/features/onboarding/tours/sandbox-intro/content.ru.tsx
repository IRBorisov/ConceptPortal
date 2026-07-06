import { HelpTopic } from '@/features/help';

import {
  IconGenerateStructure,
  IconSearch,
  IconStatusOK,
  IconStatusUnknown,
  IconTree,
  IconTypeGraph
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

import { TourHelpLink } from './tour-help-links';

export const sandboxIntroContentRu: Record<string, TourStepContent> = {
  'welcome': {
    title: 'Добро пожаловать в Песочницу',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Песочница — демонстрационная среда, работающая без регистрации. В ней есть небольшая концептуальная схема
          вместе с моделью, хранящиеся локально в вашем браузере.
        </p>
        <p>
          Этот тур проведёт по редактору: работа со списком конституент, редактирование и проверка формальных
          определений с диагностикой ошибок, а также просмотр данных модели и результатов вычислений.
        </p>
      </div>
    )
  },
  'passport': {
    title: 'Паспорт',
    body: (
      <p>
        <TourHelpLink text='Паспорт' topic={HelpTopic.UI_SCHEMA_CARD} /> содержит название схемы и модели: заголовок,
        имя и описание. Он есть у каждого элемента в библиотеке Портала. Далее посмотрим на сами конституенты.
      </p>
    )
  },
  'list': {
    title: 'Список конституент',
    body: (
      <p>
        Конституенты — строительные блоки схемы: базисные множества, термины, определения и аксиомы. На вкладке{' '}
        <TourHelpLink text='список' topic={HelpTopic.UI_MODEL_LIST} /> они собраны в одной таблице — со статусом
        вычисления, если к схеме привязана модель.
      </p>
    )
  },
  'list-filter': {
    title: 'Поиск',
    body: (
      <p>
        Строка <IconSearch className='inline-icon' /> поиска находит конституенты по имени, термину или тексту
        определения. Подробнее — в руководстве по{' '}
        <TourHelpLink text='списку конституент' topic={HelpTopic.UI_SCHEMA_LIST} />.
      </p>
    )
  },
  'list-interact': {
    title: 'Выделение и порядок',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Щелчок по строке выделяет конституенту; счётчик слева показывает число выделенных. Двойной щелчок или щелчок с{' '}
          <kbd>Alt</kbd> открывает конституенту в <TourHelpLink text='редакторе' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Перетаскивайте строки, чтобы изменить порядок в схеме. При активном поиске перестановка отключена — очистите
          строку поиска, если нужно переместить элементы.
        </p>
      </div>
    )
  },
  'concept': {
    title: 'Редактор конституенты',
    body: (
      <p>
        Здесь редактируется одна конституента в{' '}
        <TourHelpLink text='редакторе конституент' topic={HelpTopic.UI_SCHEMA_EDITOR} />: её термин, текстовое и
        формальное определение. Выбирайте конституенты в списке, чтобы открыть их на этой вкладке. В Песочнице можно
        свободно экспериментировать — данные остаются локальными.
      </p>
    )
  },
  'concept-check': {
    title: 'Проверка и диагностика',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          После правки формального определения <IconStatusUnknown className='inline-icon' /> индикатор{' '}
          <TourHelpLink text='статуса определения' topic={HelpTopic.UI_CST_STATUS} /> становится синим, пока вы не
          запустите проверку. Нажмите на него или клавиши <kbd>Ctrl + Q</kbd>, чтобы проверить выражение.
        </p>
        <p>
          При ошибках под редактором появляется список — щелчок по сообщению переносит курсор к проблемному фрагменту.
          Зелёный <IconStatusOK className='inline-icon' /> статус означает, что определение проверено.
        </p>
      </div>
    )
  },
  'concept-tools': {
    title: 'Дерево разбора и граф ступеней',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Кнопка <IconTree className='inline-icon' />{' '}
          <TourHelpLink text='дерева разбора' topic={HelpTopic.UI_FORMULA_TREE} /> открывает диалог с синтаксическим
          деревом формального определения — удобно для понимания структуры и поиска ошибок разбора.
        </p>
        <p>
          Кнопка <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='графа ступеней' topic={HelpTopic.UI_TYPE_GRAPH} /> показывает, как типы в выражении
          связаны в виде графа ступеней типизации.
        </p>
      </div>
    )
  },
  'concept-structure': {
    title: 'Планировщик структуры',
    body: (
      <p>
        Для структурных понятий кнопка <IconGenerateStructure size='1.25rem' className='inline-icon' /> Раскрыть
        структуру открывает <TourHelpLink text='планировщик структуры' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> —
        интерактивный граф для разложения понятия на порождённые конституенты. Из диаграммы можно добавлять,
        редактировать и связывать элементы.
      </p>
    )
  },
  'graph': {
    title: 'Граф термов',
    body: (
      <p>
        <TourHelpLink text='Граф термов' topic={HelpTopic.UI_GRAPH_TERM} /> визуализирует связи между понятиями: какие
        определения от каких зависят. Это помогает увидеть структуру схемы в целом.
      </p>
    )
  },
  'data': {
    title: 'Данные модели',
    body: (
      <p>
        На вкладке <TourHelpLink text='данные модели' topic={HelpTopic.UI_MODEL_VALUE} /> схема встречается с моделью:
        базисные множества получают конкретные элементы. Схема задаёт структуру, а модель заполняет её значениями из
        предметной области.
      </p>
    )
  },
  'evaluation': {
    title: 'Вычисления',
    body: (
      <p>
        На вкладке <TourHelpLink text='вычисления' topic={HelpTopic.UI_MODEL_EVALUATOR} /> определения вычисляются на
        данных модели. Здесь можно просмотреть рассчитанные значения и проблемы — например, выражения, которые нельзя
        вычислить при текущих данных.
      </p>
    )
  },
  'finish': {
    title: 'Вы готовы',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Это основной цикл: управляйте конституентами, редактируйте и проверяйте определения, задавайте данные модели и
          просматривайте результаты вычислений.
        </p>
        <p>
          Исследуйте Песочницу свободно — вы всегда можете восстановить начальные данные из меню или прочитать{' '}
          <TourHelpLink text='руководства' topic={HelpTopic.INTERFACE} />.
        </p>
      </div>
    )
  }
};
