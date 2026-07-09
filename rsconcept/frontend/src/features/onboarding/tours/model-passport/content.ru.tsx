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
        привязанную к схеме: название, доступ и статистику вычислений.
      </p>
    )
  },
  form: {
    title: 'Заголовок, имя, описание',
    body: (
      <p>
        Здесь правятся заголовок, имя и описание модели. Атрибуты схемы на этой вкладке не меняются — откройте связанную
        схему. Сохранение — <IconSave className='inline-icon' /> или <kbd>Ctrl + S</kbd>.
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
        Ссылка <IconRSForm className='inline-icon' /> открывает исходную концептуальную схему. Данные модели и
        вычисления всегда опираются на её конституенты.
      </p>
    )
  },
  library: {
    title: 'Расположение и владение',
    body: <p>Расположение, владелец, редакторы и даты — под формой, как у других элементов библиотеки.</p>
  },
  stats: {
    title: 'Панель статистики',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Боковая панель совмещает счётчики структуры схемы с проблемами модели: отсутствующие базисные данные, ложные
          аксиомы, некорректные значения и сбои вычислений.
        </p>
        <p>Это быстрая проверка состояния перед вкладками данных и вычислений.</p>
      </div>
    )
  }
};
