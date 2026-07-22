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
        Наведите на узел — фрагмент подсветится в строке сверху, а также отобразится типизация.
      </p>
    )
  },
  canvas: {
    title: 'Навигация по дереву',
    body: (
      <p>
        Щёлкните узел, чтобы выбрать подвыражение. Удерживайте <kbd>Space</kbd>, чтобы панорамировать без наведения на
        узлы; масштаб — колёсиком мыши. Цвета узлов соответствуют ролям в языке (логика, имена конституент,
        типизированные выражения).
      </p>
    )
  },
  extract: {
    title: 'Выделить конституенту',
    body: (
      <>
        <p>
          Если выделение доступно, выберите вложенный узел (не корень), затем нажмите <kbd>Q</kbd> или кнопку{' '}
          <IconNewItem className='inline-icon' /> Выделить, чтобы вынести подвыражение в новую конституенту.
        </p>
        <p>
          В панели выделения заполните терм (и при необходимости текстовое определение), затем подтвердите{' '}
          <kbd>{saveHotkey}</kbd>. <kbd>Esc</kbd> закрывает панель без выделения.
        </p>
      </>
    )
  }
};
