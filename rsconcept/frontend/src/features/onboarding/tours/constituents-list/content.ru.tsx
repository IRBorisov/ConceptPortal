import { HelpTopic } from '@/features/help';

import { IconSearch } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const constituentsListContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Список конституент',
    body: (
      <p>
        Конституенты — строительные блоки схемы: базисные множества, термины, определения и аксиомы. На вкладке{' '}
        <TourHelpLink text='список' topic={HelpTopic.UI_MODEL_LIST} /> они собраны в одной таблице — со статусом
        вычисления, если к схеме привязана модель.
      </p>
    )
  },
  filter: {
    title: 'Поиск',
    body: (
      <p>
        Строка <IconSearch className='inline-icon' /> поиска находит конституенты по имени, термину или тексту
        определения. Подробнее — в руководстве по{' '}
        <TourHelpLink text='списку конституент' topic={HelpTopic.UI_SCHEMA_LIST} />.
      </p>
    )
  },
  interact: {
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
  }
};
