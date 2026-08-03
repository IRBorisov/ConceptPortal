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
          <TourHelpLink text='Перенос' topic={HelpTopic.UI_RELOCATE_CST} /> перемещает собственные конституенты между
          схемами, связанными операцией ОСС.
        </p>
        <p>
          Выберите <b>Исходная схема</b>, переключите <b>Направление перемещения</b>{' '}
          <IconRelocationUp value={true} className='inline-icon' /> /{' '}
          <IconRelocationUp value={false} className='inline-icon' /> (вверх в аргументы или вниз в результат), затем
          укажите <b>Целевая схема</b>.
        </p>
      </>
    )
  },
  selection: {
    title: 'Что можно перенести',
    body: (
      <p>
        Список заполняется после выбора <b>Целевая схема</b> — в нём кандидаты для пары <b>Исходная схема</b> →{' '}
        <b>Целевая схема</b>; недопустимые не показываются. Переносятся только <b>собственные</b> конституенты;
        наследованные (пунктирная рамка) могут быть в списке, но не переносятся. Отметьте нужные и нажмите{' '}
        <b>Переместить</b>.
      </p>
    )
  }
};
