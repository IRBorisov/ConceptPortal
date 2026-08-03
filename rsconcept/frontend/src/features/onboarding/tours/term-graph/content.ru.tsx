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
        Вкладка «Граф» открывает <TourHelpLink text='граф термов' topic={HelpTopic.UI_GRAPH_TERM} />: связи конституент
        по формальным определениям и атрибутированию — удобно видеть структуру схемы целиком.
      </p>
    )
  },
  tools: {
    title: 'Режимы и выделение',
    body: (
      <>
        <p>
          Если редактирование разрешено, сверху доступны{' '}
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Режим: Просмотр — навигация и
          выделение; <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Режим: Редактор —
          рисование связей. В режиме редактора для атрибутивных схем{' '}
          <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> /{' '}
          <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> выбирает тип создаваемой связи.
        </p>
        <p>
          В меню «Выделить на основе выбранных…» — пункты <IconGraphCollapse className='inline-icon' /> Влияющие и{' '}
          <IconGraphExpand className='inline-icon' /> Зависимые; меню доступно при ненулевом выделении.
        </p>
      </>
    )
  },
  options: {
    title: 'Вид и фильтры',
    body: (
      <>
        <p>
          Слева — раскраска узлов и, для атрибутивных схем, фильтр отображения связей.{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) вписывает граф в экран;{' '}
          <IconFocus className='inline-icon' /> фокусирует одну конституенту (или ПКМ по узлу);{' '}
          <IconFilter className='inline-icon' /> открывает настройки отображения.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) переключает подписи;{' '}
          <IconClustering className='inline-icon' /> (<kbd>B</kbd>) скрывает порождённые узлы;{' '}
          <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>) показывает только аксиоматическое ядро;{' '}
          <IconImage className='inline-icon' /> экспортирует PNG или SVG.
        </p>
        <p>
          Попробуйте: переключите <IconText className='inline-icon' /> подписи выделенной кнопкой. Гид продолжится
          автоматически.
        </p>
      </>
    )
  },
  edit: {
    title: 'Редактирование узлов',
    body: (
      <p>
        Если редактирование разрешено, <IconNewItem className='inline-icon icon-green' /> (<kbd>R</kbd>) создаёт
        конституенту со ссылками на выделенные; <IconDestroy className='inline-icon icon-red' /> удаляет выделение;{' '}
        <IconCrucial className='inline-icon' /> (<kbd>F</kbd>) переключает статус ключевой;{' '}
        <IconTypeGraph className='inline-icon' /> открывает граф ступеней выделенных конституент.
      </p>
    )
  },
  hidden: {
    title: 'Скрытые узлы',
    body: (
      <p>
        Конституенты, отфильтрованные с холста, появляются в списке «Скрытые». Щелчок выделяет; двойной щелчок открывает
        редактирование конституенты.
      </p>
    )
  },
  canvas: {
    title: 'Узлы и навигация',
    body: (
      <>
        <p>
          Щелчок по узлу выделяет его; двойной щелчок открывает редактирование конституенты. Перемещение —{' '}
          <kbd>Space</kbd> или <kbd>WASD</kbd>, масштаб — колёсиком мыши.
        </p>
        <p>
          <kbd>Esc</kbd> снимает выделение; <kbd>Delete</kbd> удаляет выбранные конституенты, если редактирование
          разрешено.
        </p>
      </>
    )
  }
};
