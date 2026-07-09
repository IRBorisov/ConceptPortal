import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const conceptEditorContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Редактор конституенты',
    body: (
      <p>
        Здесь редактируется одна конституента в{' '}
        <TourHelpLink text='редакторе конституент' topic={HelpTopic.UI_SCHEMA_EDITOR} />: её термин, текстовое и
        формальное определение. Выбирайте конституенты в списке, чтобы открыть их на этой вкладке.
      </p>
    )
  },
  check: {
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
  tools: {
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
  structure: {
    title: 'Планировщик структуры',
    body: (
      <p>
        Для структурных понятий кнопка <IconGenerateStructure size='1.25rem' className='inline-icon' /> Раскрыть
        структуру открывает <TourHelpLink text='планировщик структуры' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> —
        интерактивный граф для разложения понятия на порождённые конституенты. Из диаграммы можно добавлять,
        редактировать и связывать элементы.
      </p>
    )
  }
};
