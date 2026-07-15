import { HelpTopic } from '@/features/help';

import { IconRSForm, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт модели',
    body: (
      <p>
        <TourHelpLink text='Паспорт модели' topic={HelpTopic.UI_MODEL_CARD} /> описывает концептуальную модель,
        привязанную к схеме: название, доступ и сводную статистику схемы и модели.
      </p>
    )
  },
  form: {
    title: 'Название, сокращение, описание',
    body: (
      <p>
        Здесь правятся название, сокращение и описание модели. Атрибуты связанной схемы на этой форме не меняются.
        Сохранение — <IconSave className='inline-icon' /> или <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Доступ',
    body: (
      <p>
        Блок <TourHelpLink text='доступа' topic={HelpTopic.ACCESS} /> задаёт политику совместного использования,
        видимость в библиотеке и режим «только чтение» для этой модели.
      </p>
    )
  },
  schema: {
    title: 'Связанная схема',
    body: (
      <p>
        Ссылка <IconRSForm className='inline-icon' /> открывает исходную концептуальную схему, на конституентах которой
        строятся данные и вычисления модели.
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
          Боковая панель совмещает счётчики структуры схемы с проблемами модели: неопределяемые без интерпретации,
          нарушенные аксиомы, неверные данные и ошибки вычисления.
        </p>
        <p>Раскройте категории, чтобы увидеть разбивку по типам.</p>
      </div>
    )
  }
};
