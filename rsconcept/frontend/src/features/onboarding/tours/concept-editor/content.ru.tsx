import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const conceptEditorContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Редактор конституенты',
    body: (
      <p>
        Здесь правится одна конституента в{' '}
        <TourHelpLink text='редакторе конституенты' topic={HelpTopic.UI_SCHEMA_EDITOR} />: термин, конвенция или
        текстовое определение и формальное определение. Выберите строку в списке слева, чтобы открыть другую
        конституенту.
      </p>
    )
  },
  fields: {
    title: 'Поля конституенты',
    body: (
      <p>
        Редактируйте термин и формальное определение. У неопределяемых понятий смысл задаёт{' '}
        <TourHelpLink text='конвенция' topic={HelpTopic.CC_CONSTITUENTA} />, у производных — текстовое определение.
        Сохранение — <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  check: {
    title: 'Проверка и диагностика',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          После правки формального определения <IconStatusUnknown className='inline-icon' /> индикатор{' '}
          <TourHelpLink text='статуса выражения' topic={HelpTopic.UI_CST_STATUS} /> становится синим, пока вы не
          запустите проверку. Нажмите на него или <kbd>Ctrl + Q</kbd>.
        </p>
        <p>
          При ошибках под редактором появляется список — щелчок переносит курсор к фрагменту. Зелёный{' '}
          <IconStatusOK className='inline-icon' /> статус «корректно» означает, что определение проверено и вычислимо.
        </p>
      </div>
    )
  },
  tools: {
    title: 'Дерево разбора и граф ступеней',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconTree className='inline-icon' /> <TourHelpLink text='Дерево разбора' topic={HelpTopic.UI_FORMULA_TREE} />{' '}
          — синтаксическое дерево формального определения: структура выражения и ошибки разбора.
        </p>
        <p>
          <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='Граф ступеней' topic={HelpTopic.UI_TYPE_GRAPH} /> — как типы в выражении связаны ступенями
          типизации.
        </p>
      </div>
    )
  },
  structure: {
    title: 'Раскрытие структуры',
    body: (
      <p>
        Если у конституенты есть структура типизации, кнопка{' '}
        <IconGenerateStructure size='1.25rem' className='inline-icon' /> Раскрыть структуру открывает{' '}
        <TourHelpLink text='раскрытие структуры' topic={HelpTopic.UI_STRUCTURE_PLANNER} />: по графу ступеней можно
        добавить порождённые конституенты и задать им термины.
      </p>
    )
  }
};
