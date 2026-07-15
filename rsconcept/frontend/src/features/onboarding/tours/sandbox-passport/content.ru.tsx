import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

export const sandboxPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт Песочницы',
    body: (
      <p>
        Паспорт задаёт название, сокращение и описание локальной демо-схемы и модели. Данные остаются в браузере — без
        доступа и владения библиотеки.
      </p>
    )
  },
  form: {
    title: 'Название, сокращение, описание',
    body: (
      <p>
        Правите демо-название, сокращение и описание. Изменения хранятся локально; <IconSave className='inline-icon' />{' '}
        применяет их к набору Песочницы.
      </p>
    )
  },
  stats: {
    title: 'Панель статистики',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Боковая панель показывает счётчики конституент схемы и проблемы модели — например неопределяемые без
          интерпретации или ошибки вычисления.
        </p>
        <p>Раскройте категории для разбивки по типам.</p>
      </div>
    )
  }
};
