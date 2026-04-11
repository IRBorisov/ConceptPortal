import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSModelList() {
  return (
    <div className='dense'>
      <h1>Список конституент модели</h1>
      <p>Интерфейс позволяет работать с списком конституент модели.</p>
      <p>
        Для редактирования определений и терминов переходите к{' '}
        <LinkTopic text='редактору конституенты' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
      </p>
      <p>
        Для работы со значениями используйте <LinkTopic text='вкладку данных модели' topic={HelpTopic.UI_MODEL_VALUE} />
        .
      </p>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconReset className='inline-icon' /> снять выделение: <kbd>ESC</kbd>
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> пересчитать модель целиком: <kbd>Alt + Q</kbd>
        </li>
        <li>
          <IconMoveUp className='inline-icon' />
          <IconMoveDown className='inline-icon' /> <kbd>Alt + вверх/вниз</kbd> перемещение конституент
        </li>
        <li>
          <IconCrucial className='inline-icon' /> переключение признака ключевой конституенты
        </li>
        <li>
          <IconOpenList className='inline-icon icon-green' /> быстрое добавление новой конституенты по типу
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> создание конституенты через диалог
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> клонирование выбранной конституенты
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удаление выбранных конституент
        </li>
      </ul>
    </div>
  );
}
