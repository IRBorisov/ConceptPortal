import { HelpTopic } from '@/features/help';
import { IconRelocationUp } from '@/features/oss/components/icon-relocation-up';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const relocateCstContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Перенос конституент',
    body: (
      <>
        <p>
          <TourHelpLink text='Перенос' topic={HelpTopic.UI_RELOCATE_CST} /> перемещает ненаследуемые конституенты между
          схемами, связанными операцией ОР — обычно вверх в схему-аргумент или вниз в результат.
        </p>
        <p>
          Выберите исходную схему, переключите направление кнопкой{' '}
          <IconRelocationUp value={true} className='inline-icon' />, затем укажите допустимую схему-назначение.
        </p>
      </>
    )
  },
  selection: {
    title: 'Что можно перенести',
    body: (
      <p>
        В списке только конституенты без наследования, допустимые для выбранного ребра. Отметьте нужные и подтвердите.
        Унаследованные и заблокированные остаются на месте, чтобы распространение оставалось согласованным.
      </p>
    )
  }
};
