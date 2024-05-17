import {
  IconAdmin,
  IconAlert,
  IconArchive,
  IconClone,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconMenu,
  IconOwner,
  IconReader,
  IconShare,
  IconUpload
} from '@/components/Icons';
import Divider from '@/components/ui/Divider';
import LinkTopic from '@/components/ui/LinkTopic';
import { HelpTopic } from '@/models/miscellaneous';

function HelpRSFormMenu() {
  return (
    <div>
      <h1>Редактирование схемы</h1>
      <p>
        При переходе к отображению отдельной концептуальной схемы сверху появляется меню, содержащее кнопки с
        выпадающими меню и ряд вкладок. Вид и количество кнопок зависит от выбранного режима работы.
      </p>

      <h2>Вкладки</h2>
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
        <LinkTopic text='Граф термов' topic={HelpTopic.UI_GRAPH_TERM} /> – графическое представление связей конституент
      </li>

      <div className='flex my-3'>
        <div>
          <h2>Меню схемы</h2>
          <li>
            <IconMenu size='1.25rem' className='inline-icon' /> Меню схемы – выпадающее меню с общими функциями
          </li>
          <li>
            <IconShare className='inline-icon' /> Поделиться – скопировать ссылку на схему
          </li>
          <li>
            <IconClone className='inline-icon' /> Клонировать – создать копию схемы
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
        </div>

        <Divider vertical margins='mx-3' />

        <div className='w-[18rem]'>
          <h2>Режимы работы</h2>
          <li>
            <IconAlert size='1.25rem' className='inline-icon icon-red' /> работа в анонимном режиме. Переход на страницу
            логина
          </li>
          <li>
            <IconArchive size='1.25rem' className='inline-icon' /> просмотр архивной версии. Переход к актуальной версии
          </li>
          <li>
            <IconReader size='1.25rem' className='inline-icon' /> режим "только чтение"
          </li>
          <li>
            <IconOwner size='1.25rem' className='inline-icon' /> режим "редактор"
          </li>
          <li>
            <IconAdmin size='1.25rem' className='inline-icon' /> режим "администратор"
          </li>
        </div>
      </div>

      <p>
        <IconEdit2 size='1.25rem' className='inline-icon' /> операции над концептуальной схемой описаны в{' '}
        <LinkTopic text='разделе Экспликация' topic={HelpTopic.RSL_OPERATIONS} />.
      </p>
    </div>
  );
}

export default HelpRSFormMenu;
