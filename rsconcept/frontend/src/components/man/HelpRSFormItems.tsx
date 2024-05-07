import { urls } from '@/app/urls';
import InfoCstStatus from '@/components/info/InfoCstStatus';
import Divider from '@/components/ui/Divider';
import { HelpTopic } from '@/models/miscellaneous';

import { IconAlias, IconMoveDown, IconMoveUp } from '../Icons';
import TextURL from '../ui/TextURL';

function HelpRSFormItems() {
  // prettier-ignore
  return (
  <div className='dense'>
    <h1>Список конституент</h1>
    <p><IconAlias className='inline-icon'/>Конституенты обладают уникальным <TextURL text='Именем' href={urls.help_topic(HelpTopic.CST_ATTRIBUTES)}/></p>
    <p><IconMoveUp className='inline-icon'/><IconMoveDown className='inline-icon'/> Список поддерживает выделение и перемещение </p>

    <h2>Управление списком</h2>
    <li>Клик на строку – выделение</li>
    <li>Shift + клик – выделение нескольких</li>
    <li>Alt + клик – Редактор</li>
    <li>Двойной клик – Редактор</li>
    <li>Alt + вверх/вниз – перемещение</li>
    <li>Delete – удаление</li>
    <li>Alt + 1-6,Q,W – добавление</li>

    <Divider margins='my-2' />

    <InfoCstStatus title='Статусы' />
  </div>);
}

export default HelpRSFormItems;
