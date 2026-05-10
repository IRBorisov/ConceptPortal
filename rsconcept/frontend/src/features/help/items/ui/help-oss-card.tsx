import { useTx } from '@/i18n';

import { IconDestroy, IconEditor, IconFolderEdit, IconOwner, IconSave, IconShare } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpOssCard() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.passport')}</h1>

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
          Боковая область статистики (кнопка раскрытия панели) показывает число операций по типам (блоки, загрузка,
          синтез, реплика) и сводку по связанным концептуальным схемам (всего, собственные, импорт).
        </li>
        <li>
          Теоретические основы синтеза изложены в&nbsp;
          <LinkTopic text='Операционная схема синтеза' topic={HelpTopic.CC_OSS} />.
        </li>
      </ul>

      <h2>{tx('tx.general.controls')}</h2>
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
          <IconDestroy className='inline-icon icon-red' /> удалить из базы Портала
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> редактировать расположение
        </li>
      </ul>
    </>
  );
}
