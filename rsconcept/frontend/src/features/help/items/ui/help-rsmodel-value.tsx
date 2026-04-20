import {
  IconCalculateAll,
  IconCalculateOne,
  IconDatabase,
  IconDestroy,
  IconDownload,
  IconReset,
  IconSave,
  IconText,
  IconTree,
  IconTypeGraph,
  IconUpload
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSModelValue() {
  return (
    <div className='dense'>
      <h1>Данные модели</h1>
      <p>Здесь можно просмотреть и изменить значение конституенты</p>
      <p>
        Чтобы вычислить значение, нажмите на <LinkTopic text='статус' topic={HelpTopic.UI_EVAL_STATUS} />
      </p>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconCalculateOne className='inline-icon icon-green' /> вычислить текущую конституенту:{' '}
          <kbd>{isMac() ? 'Cmd + Q' : 'Ctrl + Q'}</kbd>
        </li>
        <li>
          <IconDatabase className='inline-icon' /> диалог просмотра или редактирования значения
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить сохраненное значение
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> пересчитать модель целиком: <kbd>Alt + Q</kbd>
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> отображение{' '}
          <LinkTopic text='графа ступеней типизации' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> отображение{' '}
          <LinkTopic text='дерева разбора' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <IconSave className='inline-icon' /> сохранить значение: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconReset className='inline-icon' /> сброс изменений
        </li>
        <li>
          <IconUpload className='inline-icon' /> импорт значения из буфера обмена или файла
        </li>
        <li>
          <IconDownload className='inline-icon' /> экспорт значения в буфер обмена или файл
        </li>
        <li>
          <IconText className='inline-icon' /> отображение текста или идентификаторов
        </li>
      </ul>
    </div>
  );
}
