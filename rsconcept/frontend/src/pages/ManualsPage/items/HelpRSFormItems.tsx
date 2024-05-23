import InfoCstStatus from '@/components/info/InfoCstStatus';
import Divider from '@/components/ui/Divider';
import { HelpTopic } from '@/models/miscellaneous';

import { IconAlias, IconDestroy, IconMoveDown, IconMoveUp, IconOpenList, IconReset } from '../../../components/Icons';
import LinkTopic from '../../../components/ui/LinkTopic';

function HelpRSFormItems() {
  return (
    <div className='dense'>
      <h1>Список конституент</h1>
      <p>
        <IconAlias className='inline-icon' />
        Конституенты обладают уникальным <LinkTopic text='Именем' topic={HelpTopic.CC_CONSTITUENTA} />
      </p>

      <h2>Управление списком</h2>
      <li>
        <IconReset className='inline-icon' /> сбросить выделение: ESC
      </li>
      <li>Клик на строку – выделение</li>
      <li>Shift + клик – выделение нескольких</li>
      <li>Alt + клик – Редактор</li>
      <li>Двойной клик – Редактор</li>
      <li>
        <IconMoveUp className='inline-icon' />
        <IconMoveDown className='inline-icon' /> Alt + вверх/вниз – перемещение
      </li>
      <li>
        <IconDestroy className='inline-icon icon-red' /> удаление: Delete
      </li>
      <li>
        <IconOpenList className='inline-icon icon-green' /> добавление: Alt + 1-6,Q,W –{' '}
      </li>

      <Divider margins='my-2' />

      <InfoCstStatus title='Статусы' />
    </div>
  );
}

export default HelpRSFormItems;
