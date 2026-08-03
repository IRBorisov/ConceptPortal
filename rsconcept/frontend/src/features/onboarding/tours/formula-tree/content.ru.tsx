import { HelpTopic } from '@/features/help';

import { IconNewItem } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const formulaTreeContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Дерево разбора',
    body: (
      <p>
        <TourHelpLink text='Дерево разбора' topic={HelpTopic.UI_FORMULA_TREE} /> показывает структуру выражения.
        Наведите на узел — фрагмент подсветится в строке сверху; типизация — во всплывающей подсказке у узла.
      </p>
    )
  },
  canvas: {
    title: 'Навигация по дереву',
    body: (
      <p>
        Щёлкните узел, чтобы выбрать подвыражение. Удерживайте <kbd>Space</kbd>, чтобы перемещать вид, не задевая узлы;
        масштаб — колёсиком мыши. Цвета узлов соответствуют ролям в языке (логика, идентификаторы, типизированные и
        составные выражения) — полный список в{' '}
        <TourHelpLink text='справке' topic={HelpTopic.UI_FORMULA_TREE} />.
      </p>
    )
  },
  extract: {
    title: 'Обособить конституенту',
    body: (
      <>
        <p>
          Доступно для вложенного узла с подузлами (не корень); в режиме только просмотра кнопка недоступна. Выберите
          такой узел, затем нажмите <kbd>Q</kbd> или кнопку <IconNewItem className='inline-icon' /> Обособить, чтобы
          открыть панель обособления и вынести подвыражение в новую конституенту. Повторное <kbd>Q</kbd> закрывает
          панель.
        </p>
        <p>
          В панели обособления заполните новый термин (и при необходимости новое текстовое определение), затем
          подтвердите <kbd>{saveHotkey}</kbd>. <kbd>Esc</kbd> закрывает панель без обособления.
        </p>
      </>
    )
  }
};
