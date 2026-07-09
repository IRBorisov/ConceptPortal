import { HelpTopic } from '@/features/help';

import { IconDownload, IconFilterReset, IconFolder, IconSearch, IconSortAsc, IconSubfolders } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const libraryIntroContentRu: Record<string, TourStepContent> = {
  welcome: {
    title: 'Библиотека',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <TourHelpLink text='Библиотека' topic={HelpTopic.UI_LIBRARY} /> — место, где вы просматриваете и открываете
          концептуальные схемы, модели и схемы операционного синтеза, хранящиеся в Портале.
        </p>
        <p>Этот короткий тур охватывает папки, поиск и таблицу элементов.</p>
      </div>
    )
  },
  folders: {
    title: 'Папки',
    body: (
      <p>
        Слева — проводник расположений. Щелчок по папке показывает её элементы справа. Ctrl/Cmd+щелчок копирует путь.
        Иконки папок показывают, есть ли в расположении элементы или вложенные папки.
      </p>
    )
  },
  location: {
    title: 'Текущее расположение',
    body: (
      <p>
        Хлебные крошки показывают активный путь. Кнопка <IconFolder className='inline-icon' /> переименовывает папку
        (если доступно), а <IconSubfolders className='inline-icon' /> включает или скрывает элементы из вложенных папок.
      </p>
    )
  },
  search: {
    title: 'Поиск и фильтры',
    body: (
      <p>
        Фильтруйте по типу, переключайте поиск по метаданным и по контексту с помощью{' '}
        <IconSearch className='inline-icon' />, сужайте выдачу по владельцу. <IconFilterReset className='inline-icon' />{' '}
        сбрасывает пользовательские фильтры.
      </p>
    )
  },
  table: {
    title: 'Таблица элементов',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Щелчок по строке открывает элемент. Ctrl/Cmd+щелчок — в новой вкладке. Сортировка — по заголовкам столбцов{' '}
          <IconSortAsc className='inline-icon' />, экспорт видимой таблицы — <IconDownload className='inline-icon' />.
        </p>
        <p>Зелёные строки — OSS, оранжевые — концептуальные модели.</p>
      </div>
    )
  }
};
