import {
  IconDestroy,
  IconEditor,
  IconFolderEdit,
  IconImmutable,
  IconLeftOpen,
  IconOwner,
  IconPublic,
  IconSave,
  IconShare
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpOssCard() {
  return (
    <div className='dense'>
      <h1>Паспорт ОСС</h1>

      <p>Паспорт содержит сведения об операционной схеме синтеза в библиотеке и сводную статистику по операциям.</p>
      <p>
        Поля формы, блок «Доступ» и расположение устроены аналогично&nbsp;
        <LinkTopic text='паспорту концептуальной схемы' topic={HelpTopic.UI_SCHEMA_CARD} />.
      </p>
      <p>
        Состав операций и граф связей редактируются&nbsp;
        <LinkTopic text='в режиме операционной схемы' topic={HelpTopic.UI_OSS_GRAPH} /> и&nbsp;
        <LinkTopic text='в боковой панели' topic={HelpTopic.UI_OSS_SIDEBAR} />.
      </p>

      <h2>Особенности ОСС</h2>
      <ul>
        <li>
          Боковая область статистики (кнопка раскрытия панели) показывает число операций по типам (блоки,
          загрузка, синтез, реплика) и сводку по связанным концептуальным схемам (всего, собственные, внешние).
        </li>
        <li>
          Теоретические основы синтеза изложены в&nbsp;
          <LinkTopic text='Операционная схема синтеза' topic={HelpTopic.CC_OSS} />.
        </li>
      </ul>

      <h2>Управление</h2>
      <ul>
        <li>
          <IconSave className='inline-icon' /> сохранить: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> копировать ссылку на ОСС
        </li>
        <li>
          <IconEditor className='inline-icon' /> редактор — право редактирования
        </li>
        <li>
          <IconOwner className='inline-icon' /> владелец — полный доступ
        </li>
        <li>
          <IconPublic className='inline-icon' /> общедоступные — видны всем
        </li>
        <li>
          <IconImmutable className='inline-icon' /> неизменяемые ОСС
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> удалить из базы Портала
        </li>
        <li>
          <IconLeftOpen className='inline-icon' /> открыть статистику
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> редактировать расположение
        </li>
      </ul>
    </div>
  );
}
