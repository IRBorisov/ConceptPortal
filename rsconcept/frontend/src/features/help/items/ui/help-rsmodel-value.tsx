import {
  IconCalculateAll,
  IconCalculateOne,
  IconDatabase,
  IconDestroy,
  IconDownload,
  IconLeftOpen,
  IconReset,
  IconText,
  IconTree,
  IconTypeGraph,
  IconUpload
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSModelValue() {
  return (
    <div className='dense'>
      <h1>Данные модели</h1>
      <p>
        Здесь можно просмотреть и изменить значение конституенты
      </p>
      <p>
        Чтобы вычислить значение, нажмите на <LinkTopic text='статус' topic={HelpTopic.UI_RSMODEL_STATUS} />
      </p>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconReset className='inline-icon' /> сброс несохраненных изменений
        </li>
        <li>
          <IconCalculateOne className='inline-icon icon-green' /> вычислить значение текущей конституенты
        </li>
        <li>
          <IconDatabase className='inline-icon' /> диалог просмотра или редактирования значения
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить сохраненное значение
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> пересчитать модель целиком
        </li>
        <li>
          <IconLeftOpen className='inline-icon' /> список конституент
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
