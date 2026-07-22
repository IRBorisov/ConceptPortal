import { HelpTopic } from '@/features/help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';

import {
  IconConceptBlock,
  IconDestroy,
  IconEdit2,
  IconFitImage,
  IconImage,
  IconNewItem,
  IconReset,
  IconSave,
  IconSettings,
  IconSynthesis
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossGraphContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Граф ОСС',
    body: (
      <p>
        На <TourHelpLink text='графе ОСС' topic={HelpTopic.UI_OSS_GRAPH} /> собирается операционный синтез: блоки,
        загрузки, узлы синтеза и репликации.
      </p>
    )
  },
  view: {
    title: 'Управление видом',
    body: (
      <>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) сбрасывает несохранённые сдвиги;{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) подгоняет граф;{' '}
          <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) открывает панель
          содержания; <IconSettings className='inline-icon' /> — сетка, линии и анимация;{' '}
          <IconImage className='inline-icon' /> — экспорт PNG или SVG.
        </p>
      </>
    )
  },
  edit: {
    title: 'Создание и правка узлов',
    body: (
      <>
        <p>
          Если редактирование разрешено, <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) сохраняет позиции;{' '}
          <IconEdit2 className='inline-icon' /> открывает то же меню, что правый щелчок по выбранному узлу;{' '}
          <IconNewItem className='inline-icon icon-green' /> добавляет{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> блок, пустую схему, импорт схемы или{' '}
          <IconSynthesis className='inline-icon' /> синтез; <IconDestroy className='inline-icon icon-red' /> удаляет
          выделение.
        </p>
        <p>
          В контекстном меню также: активация, репликация, клон КС, перенос конституент и открытие связанной схемы — см.{' '}
          <TourHelpLink text='справку по графу ОСС' topic={HelpTopic.UI_OSS_GRAPH} />.
        </p>
      </>
    )
  },
  canvas: {
    title: 'Работа с холстом',
    body: (
      <>
        <p>
          Щелчок выделяет узел; <kbd>Shift</kbd>+щелчок расширяет выделение. Двойной щелчок открывает связанную КС (или
          редактор блока). Перетаскивайте узлы; тяните от ручки к узлу синтеза, чтобы добавить аргумент.
        </p>
        <p>
          Перемещение холста — <kbd>Space</kbd>, масштаб — колёсиком, сброс выделения — <kbd>Esc</kbd>, удаление —{' '}
          <kbd>Delete</kbd>, если редактирование разрешено.
        </p>
      </>
    )
  },
  sidebar: {
    title: 'Панель содержания',
    body: (
      <p>
        <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) открывает{' '}
        <TourHelpLink text='панель содержания' topic={HelpTopic.UI_OSS_SIDEBAR} />: правка конституент схемы выбранной
        операции — фильтр, создание, клон, удаление, порядок, граф термов и граф ступеней. Выберите операцию со
        связанной схемой, чтобы панель заполнилась.
      </p>
    )
  }
};
