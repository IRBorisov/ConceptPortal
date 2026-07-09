import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const sandboxPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт Песочницы',
    body: (
      <p>
        В Песочнице паспорт задаёт имя локальной демо-схемы и модели. Данные остаются в браузере — без доступа и
        владения библиотеки. Полные паспорта описаны в разделах{' '}
        <TourHelpLink text='паспорта схемы' topic={HelpTopic.UI_SCHEMA_CARD} /> и{' '}
        <TourHelpLink text='паспорта модели' topic={HelpTopic.UI_MODEL_CARD} />.
      </p>
    )
  },
  form: {
    title: 'Заголовок, имя, описание',
    body: (
      <p>
        Правите демо-заголовок, имя и описание. Изменения хранятся локально; <IconSave className='inline-icon' />{' '}
        применяет их к набору Песочницы.
      </p>
    )
  },
  stats: {
    title: 'Панель статистики',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Боковая панель в том же духе, что у паспорта модели: счётчики конституент схемы и проблемы модели — например
          отсутствующие базисные данные или сбои вычислений.
        </p>
        <p>
          Раскройте категории для разбивки. В библиотеке у паспортов схемы и модели есть ещё доступ, расположение и
          другое.
        </p>
      </div>
    )
  }
};
