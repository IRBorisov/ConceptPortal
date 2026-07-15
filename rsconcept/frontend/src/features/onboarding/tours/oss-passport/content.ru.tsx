import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт ОСС',
    body: (
      <p>
        <TourHelpLink text='Паспорт ОСС' topic={HelpTopic.UI_OSS_CARD} /> идентифицирует операционную схему синтеза в
        библиотеке: название, доступ и сводную статистику операций.
      </p>
    )
  },
  form: {
    title: 'Название, сокращение, описание',
    body: (
      <p>
        Название, сокращение и описание задают идентификацию ОСС в библиотеке. Сохранение —{' '}
        <IconSave className='inline-icon' /> или <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Доступ',
    body: (
      <p>
        Блок <TourHelpLink text='доступа' topic={HelpTopic.ACCESS} /> задаёт политику совместного использования,
        видимость в библиотеке и режим «только чтение».
      </p>
    )
  },
  library: {
    title: 'Расположение и владение',
    body: <p>Под формой — расположение в библиотеке, владелец, редакторы и даты создания/обновления.</p>
  },
  stats: {
    title: 'Панель статистики',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Боковая панель считает операции по типам (блоки, загрузка, синтез, реплика) и связанные концептуальные схемы
          (всего, собственные, импорт).
        </p>
        <p>Раскройте категории, чтобы увидеть разбивку.</p>
      </div>
    )
  },
  graph: {
    title: 'Граф операций',
    body: (
      <p>
        На вкладке <TourHelpLink text='граф ОСС' topic={HelpTopic.UI_OSS_GRAPH} /> собирают блоки, загрузки, синтез и
        репликации. «Подробнее» — вид, правка, холст и панель содержания.
      </p>
    )
  }
};
