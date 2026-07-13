import { HelpTopic } from '@/features/help';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import {
  IconClustering,
  IconCrucial,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphExpand,
  IconImage,
  IconNewItem,
  IconOverviewCore,
  IconText,
  IconTypeGraph
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const termGraphContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Граф термов',
    body: (
      <p>
        <TourHelpLink text='Граф термов' topic={HelpTopic.UI_GRAPH_TERM} /> показывает связи между конституентами: какие
        определения от каких зависят. Он помогает увидеть структуру схемы в целом.
      </p>
    )
  },
  options: {
    title: 'Вид и фильтры',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Слева выбираются раскраска узлов и типы связей. <IconFitImage className='inline-icon' /> подгоняет граф;{' '}
          <IconFocus className='inline-icon' /> фокусирует одну конституенту; <IconFilter className='inline-icon' />{' '}
          открывает настройки раскладки и фильтров.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) переключает подписи;{' '}
          <IconClustering className='inline-icon' /> (<kbd>V</kbd>) скрывает порождённые узлы;{' '}
          <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>) показывает только аксиоматическое ядро;{' '}
          <IconImage className='inline-icon' /> экспортирует PNG или SVG.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Редактирование узлов',
    body: (
      <p>
        Если редактирование разрешено, <IconNewItem className='inline-icon icon-green' /> (<kbd>R</kbd>) создаёт
        конституенту; <IconDestroy className='inline-icon icon-red' /> удаляет выделение;{' '}
        <IconCrucial className='inline-icon' /> (<kbd>F</kbd>) переключает ключевой статус;{' '}
        <IconTypeGraph className='inline-icon' /> открывает граф ступеней для выделения.
      </p>
    )
  },
  hidden: {
    title: 'Скрытые узлы',
    body: (
      <p>
        Конституенты, отфильтрованные с холста, появляются в списке скрытых. Щелчок выделяет элемент; активация
        открывает редактор конституенты.
      </p>
    )
  },
  tools: {
    title: 'Режимы и выделение',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Обзор — навигация и выделение;{' '}
          <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Редактирование — рисование
          связей. Рёбра атрибуции и определения: <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' />{' '}
          / <IconEdgeType value={TGEdgeType.definition} className='inline-icon' />.
        </p>
        <p>
          Помощники выделения расширяют связанные узлы — например <IconGraphCollapse className='inline-icon' /> влияющие
          и <IconGraphExpand className='inline-icon' /> зависимые.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Узлы и навигация',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Щелчок по узлу выделяет его; двойной щелчок открывает редактор конституенты. Перемещение — <kbd>Space</kbd>{' '}
          или <kbd>WASD</kbd>, масштаб — колёсиком мыши.
        </p>
        <p>
          <kbd>Esc</kbd> снимает выделение; <kbd>Delete</kbd> удаляет выбранные конституенты, если редактирование
          разрешено.
        </p>
      </div>
    )
  }
};
