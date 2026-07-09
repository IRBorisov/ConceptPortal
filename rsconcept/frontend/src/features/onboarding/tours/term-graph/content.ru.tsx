import { HelpTopic } from '@/features/help';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import {
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphExpand
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
      <p>
        Слева выбираются раскраска узлов и типы связей. <IconFitImage className='inline-icon' /> подгоняет граф под
        экран, <IconFocus className='inline-icon' /> фокусирует одну конституенту, а{' '}
        <IconFilter className='inline-icon' /> открывает настройки раскладки и фильтров.
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
          Помощники выделения расширяют связанные узлы — например{' '}
          <IconGraphCollapse className='inline-icon' /> влияющие и <IconGraphExpand className='inline-icon' /> зависимые.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Узлы и навигация',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Щелчок по узлу выделяет его; двойной щелчок открывает редактор конституенты. Перемещение — <kbd>Space</kbd> или{' '}
          <kbd>WASD</kbd>, масштаб — колёсиком мыши.
        </p>
        <p>
          <kbd>Esc</kbd> снимает выделение; <kbd>Delete</kbd> удаляет выбранные конституенты, если редактирование
          разрешено.
        </p>
      </div>
    )
  }
};
