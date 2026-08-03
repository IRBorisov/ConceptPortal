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
        На <TourHelpLink text='графе ОСС' topic={HelpTopic.UI_OSS_GRAPH} /> строится операционная схема синтеза: блоки,
        загрузки, узлы синтеза и репликации. Метаданные, доступ и статистика — на вкладке «Паспорт».
      </p>
    )
  },
  view: {
    title: 'Управление видом',
    body: (
      <>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) — «Сбросить изменения»;{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) вписывает граф в экран;{' '}
          <IconSettings className='inline-icon' /> «Настройки»: координаты, сетка (<kbd>X</kbd>), анимация связей, форма
          связей (<kbd>T</kbd>); <IconImage className='inline-icon' /> — «Сохранить изображение» (PNG или SVG).
        </p>
      </>
    )
  },
  edit: {
    title: 'Создание и правка узлов',
    body: (
      <>
        <p>
          Если редактирование разрешено, вторая строка тулбара: <IconSave className='inline-icon' /> (
          <kbd>Ctrl + S</kbd>) — «Сохранить изменения»; <IconEdit2 className='inline-icon' /> открывает то же меню, что
          правый щелчок по выбранному узлу; <IconNewItem className='inline-icon icon-green' /> «Добавить…» —{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> новый блок, новая КС, импорт схемы или{' '}
          <IconSynthesis className='inline-icon' /> синтез; <IconDestroy className='inline-icon icon-red' /> удаляет
          выделение. Без правки — см. доступ в паспорте.
        </p>
        <p>
          В контекстном меню также: «Выполнить операцию», «Создать реплику», «Клонировать», «Конституенты» (
          <TourHelpLink text='перенос между схемами' topic={HelpTopic.UI_RELOCATE_CST} />) и открытие связанной схемы —
          см. <TourHelpLink text='справку по графу ОСС' topic={HelpTopic.UI_OSS_GRAPH} />.
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
          редактор блока). Перетаскивайте узлы; тяните от точки соединения к узлу синтеза, чтобы добавить аргумент.
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
        Нажмите <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> или <kbd>V</kbd>, чтобы
        открыть <TourHelpLink text='панель содержания' topic={HelpTopic.UI_OSS_SIDEBAR} />: правка конституент схемы
        выбранной операции — фильтр, создание, клон, удаление, порядок, граф термов и граф ступеней. Выберите операцию
        со связанной схемой, чтобы панель заполнилась.
      </p>
    )
  }
};
