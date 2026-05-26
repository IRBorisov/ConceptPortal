import { useTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library';

import { IconCstType } from '@/features/rsform/components/icon-cst-type';

import {
  IconAdmin,
  IconAlert,
  IconArchive,
  IconClone,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconEditor,
  IconGenerateNames,
  IconInlineSynthesis,
  IconMenu,
  IconOwner,
  IconPDF,
  IconQR,
  IconReader,
  IconReplace,
  IconRSModel,
  IconSandbox,
  IconShare,
  IconSortList,
  IconTemplates,
  IconUpload
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaMenuRu() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.edit')}</h1>
      <p>
        При переходе к отображению отдельной концептуальной схемы сверху появляется меню, содержащее кнопки с
        выпадающими меню и ряд вкладок. Вид и количество кнопок зависит от выбранного режима работы.
      </p>

      <h2>{tx('tx.general.tab.plural')}</h2>
      <ul>
        <li>
          <LinkTopic text='Паспорт' topic={HelpTopic.UI_SCHEMA_CARD} /> – редактирование атрибутов схемы и версии
        </li>
        <li>
          <LinkTopic text='Список' topic={HelpTopic.UI_SCHEMA_LIST} /> – работа со списком конституент в табличной форме
        </li>
        <li>
          <LinkTopic text='Понятие' topic={HelpTopic.UI_SCHEMA_EDITOR} /> – редактирование отдельной{' '}
          <LinkTopic text='Конституенты' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <LinkTopic text='Граф' topic={HelpTopic.UI_GRAPH_TERM} /> – графическое представление связей конституент
        </li>
      </ul>

      <h2>{tx('tx.schema.menu')}</h2>
      <ul>
        <li>
          <IconMenu size='1.25rem' className='inline-icon' /> Меню схемы – выпадающее меню с общими функциями
        </li>
        <li>
          <IconShare className='inline-icon' /> Поделиться – скопировать ссылку на схему
        </li>
        <li>
          <IconQR className='inline-icon' /> Показать QR-код схемы
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> Клонировать – создать копию схемы
        </li>
        <li>
          <IconRSModel className='inline-icon icon-green' /> Создать модель – создать модель на основе схемы
        </li>
        <li>
          <IconSandbox className='inline-icon icon-green' /> Открыть в песочнице – открыть схему в локальном редакторе
        </li>
        <li>
          <IconPDF className='inline-icon' /> Экспортировать в PDF – сохранить в файле формата PDF
        </li>
        <li>
          <IconDownload className='inline-icon' /> Выгрузить – сохранить в файле формата Экстеор
        </li>
        <li>
          <IconUpload className='inline-icon icon-red' /> Загрузить – заменить схему на содержимое файла Экстеор
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> Удалить – удаляет схему из базы Портала
        </li>
      </ul>

      <h2>{tx('tx.general.editing')}</h2>
      <ul>
        <li>
          <IconEdit2 size='1.25rem' className='inline-icon' /> Операции описаны подробно в{' '}
          <LinkTopic text='разделе Экспликация' topic={HelpTopic.RSL_OPERATIONS} />.
        </li>
        <li>
          <IconTemplates size='1.25rem' className='inline-icon' /> Генерация конституент из шаблонов выражений
        </li>
        <li>
          <IconInlineSynthesis size='1.25rem' className='inline-icon' /> Вставка конституент из другой схемы
        </li>
        <li>
          <IconCstType value={CstType.NOMINAL} size='1.25rem' className='inline-icon' /> Включение формы атрибутирования
        </li>
        <li>
          <IconSortList size='1.25rem' className='inline-icon' /> Упорядочить список конституент
        </li>
        <li>
          <IconGenerateNames size='1.25rem' className='inline-icon' /> Перенумеровать конституенты в порядке объявления
        </li>
        <li>
          <IconReplace size='1.25rem' className='inline-icon' /> Отождествление конституент текущей схемы
        </li>
      </ul>

      <h2>{tx('tx.general.role.plural')}</h2>
      <ul>
        <li>
          <IconAlert size='1.25rem' className='inline-icon icon-red' /> работа в анонимном режиме. Переход на страницу
          логина
        </li>
        <li>
          <IconArchive size='1.25rem' className='inline-icon' /> просмотр архивной версии. Переход к актуальной версии
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
    </>
  );
}
