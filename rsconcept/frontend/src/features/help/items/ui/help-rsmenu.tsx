import { Divider } from '@/components/container';
import {
  IconAdmin,
  IconAlert,
  IconArchive,
  IconClone,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconEditor,
  IconMenu,
  IconOwner,
  IconQR,
  IconReader,
  IconRobot,
  IconShare,
  IconUpload
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSMenu() {
  return (
    <div>
      <h1>Редактирование схемы</h1>
      <p>
        При переходе к отображению отдельной концептуальной схемы сверху появляется меню, содержащее кнопки с
        выпадающими меню и ряд вкладок. Вид и количество кнопок зависит от выбранного режима работы.
      </p>

      <h2>Вкладки</h2>
      <ul>
        <li>
          <LinkTopic text='Карточка' topic={HelpTopic.UI_RS_CARD} /> – редактирование атрибутов схемы и версии
        </li>
        <li>
          <LinkTopic text='Содержание' topic={HelpTopic.UI_RS_LIST} /> – работа со списком конституент в табличной форме
        </li>
        <li>
          <LinkTopic text='Редактор' topic={HelpTopic.UI_RS_EDITOR} /> – редактирование отдельной{' '}
          <LinkTopic text='Конституенты' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <LinkTopic text='Граф термов' topic={HelpTopic.UI_GRAPH_TERM} /> – графическое представление связей
          конституент
        </li>
      </ul>

      <div className='flex my-3'>
        <div>
          <h2>Меню схемы</h2>
          <ul>
            <li>
              <IconMenu size='1.25rem' className='inline-icon' /> Меню схемы – выпадающее меню с общими функциями
            </li>
            <li>
              <IconShare className='inline-icon' /> Поделиться – скопировать ссылку на схему
            </li>
            <li>
              <IconQR className='inline-icon' /> Отобразить QR-код схемы
            </li>
            <li>
              <IconRobot className='inline-icon' /> Генерировать запрос для LLM
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> Клонировать – создать копию схемы
            </li>
            <li>
              <IconDownload className='inline-icon' /> Выгрузить – сохранить в файле формата Экстеор
            </li>
            <li>
              <IconUpload className='inline-icon icon-red' /> Загрузить – заменить схему на содержимое файла Экстеор
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> Удалить – полностью удаляет схему из базы Портала
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' />

        <div className='w-72'>
          <h2>Режимы работы</h2>
          <ul>
            <li>
              <IconAlert size='1.25rem' className='inline-icon icon-red' /> работа в анонимном режиме. Переход на
              страницу логина
            </li>
            <li>
              <IconArchive size='1.25rem' className='inline-icon' /> просмотр архивной версии. Переход к актуальной
              версии
            </li>
            <li>
              <IconReader size='1.25rem' className='inline-icon' /> режим Читатель
            </li>
            <li>
              <IconEditor size='1.25rem' className='inline-icon' /> режим Редактор
            </li>
            <li>
              <IconOwner size='1.25rem' className='inline-icon' /> режим Владелец
            </li>
            <li>
              <IconAdmin size='1.25rem' className='inline-icon' /> режим Администратор
            </li>
          </ul>
        </div>
      </div>

      <p>Нижестоящие в списке режимы работы включают все права и доступные функции вышестоящих</p>

      <p>
        <IconEdit2 size='1.25rem' className='inline-icon icon-green' /> операции над концептуальной схемой описаны в{' '}
        <LinkTopic text='разделе Экспликация' topic={HelpTopic.RSL_OPERATIONS} />.
      </p>
    </div>
  );
}
