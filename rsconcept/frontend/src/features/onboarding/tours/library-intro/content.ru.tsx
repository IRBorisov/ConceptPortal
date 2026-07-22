import { HelpTopic } from '@/features/help';

import {
  IconDownload,
  IconFilterReset,
  IconFolderEdit,
  IconSearch,
  IconSortAsc,
  IconSubfolders,
  IconText
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const libraryIntroContentRu: Record<string, TourStepContent> = {
  welcome: {
    title: 'Библиотека',
    body: (
      <>
        <p>
          <TourHelpLink text='Библиотека' topic={HelpTopic.UI_LIBRARY} /> — место, где вы просматриваете и открываете
          концептуальные схемы, модели и операционные схемы синтеза (ОСС), хранящиеся в Портале.
        </p>
        <p>Этот короткий тур охватывает папки, поиск и таблицу элементов.</p>
      </>
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
        Хлебные крошки показывают активный путь. Кнопка <IconFolderEdit className='inline-icon' /> переименовывает папку
        (если доступно), а <IconSubfolders className='inline-icon' /> включает или скрывает элементы из вложенных папок.
      </p>
    )
  },
  search: {
    title: 'Поиск и фильтры',
    body: (
      <p>
        Чипы типа сужают список до схем, моделей или ОСС. Режим «Метаданные» (<IconSearch className='inline-icon' />) и
        «Контекстный поиск» (<IconText className='inline-icon' />) переключаются селектором; при необходимости — фильтр
        по владельцу. <IconFilterReset className='inline-icon' /> сбрасывает пользовательские фильтры.
      </p>
    )
  },
  table: {
    title: 'Таблица элементов',
    body: (
      <>
        <p>
          Щелчок по строке открывает элемент. Ctrl/Cmd+щелчок — в новой вкладке. Сортировка — по заголовкам столбцов{' '}
          <IconSortAsc className='inline-icon' />, экспорт видимой таблицы — <IconDownload className='inline-icon' />.
        </p>
        <p>Цвет строки показывает тип: зелёные — ОСС, оранжевые — концептуальные модели, остальные — схемы.</p>
      </>
    )
  }
};
