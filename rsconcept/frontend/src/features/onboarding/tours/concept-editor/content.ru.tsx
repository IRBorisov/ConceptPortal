import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';
const checkHotkey = isMac() ? 'Cmd + Q' : 'Ctrl + Q';

export const conceptEditorContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Понятие',
    body: (
      <p>
        Вкладка «Понятие» — редактирование одной конституенты в{' '}
        <TourHelpLink text='редакторе конституенты' topic={HelpTopic.UI_SCHEMA_EDITOR} />. Выберите строку в списке
        слева, чтобы открыть другую конституенту.
      </p>
    )
  },
  fields: {
    title: 'Поля конституенты',
    body: (
      <p>
        Редактируйте термин, типизацию и формальное выражение (лейбл поля зависит от типа: формальное определение,
        область определения, определение функции…). У неопределяемых понятий смысл задаёт{' '}
        <TourHelpLink text='конвенция' topic={HelpTopic.CC_CONSTITUENTA} />, у производных — текстовое определение.
        Сохранение — <kbd>{saveHotkey}</kbd>.
      </p>
    )
  },
  check: {
    title: 'Проверка и диагностика',
    body: (
      <>
        <p>
          Пилюля <IconStatusUnknown className='inline-icon' /> «не проверено» (синяя) — нажмите на неё или{' '}
          <kbd>{checkHotkey}</kbd>, чтобы{' '}
          <TourHelpLink text='проверить выражение' topic={HelpTopic.UI_CST_STATUS} />.
        </p>
        <p>
          При ошибках под редактором появляется список — щелчок переносит курсор к фрагменту. Зелёный{' '}
          <IconStatusOK className='inline-icon' /> «корректно» означает, что определение проверено и вычислимо; зелёный
          «неразмерное» — что выражение проверено, но задаёт лишь проверку принадлежности.
        </p>
      </>
    )
  },
  tools: {
    title: 'Дерево разбора и структура типизации',
    body: (
      <>
        <p>
          Иконки справа у поля выражения: справка, символьная клавиатура, структура типизации и дерево разбора.
        </p>
        <p>
          <IconTree className='inline-icon' /> <TourHelpLink text='Дерево разбора' topic={HelpTopic.UI_FORMULA_TREE} />{' '}
          — синтаксическое дерево формального выражения: структура и ошибки разбора.
        </p>
        <p>
          <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='Структура типизации выражения' topic={HelpTopic.UI_TYPE_GRAPH} /> — как типы в выражении
          связаны ступенями типизации (для логических конституент иконка скрыта).
        </p>
      </>
    )
  },
  structure: {
    title: 'Раскрыть структуру',
    body: (
      <p>
        Если доступна кнопка <IconGenerateStructure size='1.25rem' className='inline-icon' /> Раскрыть структуру, она
        открывает <TourHelpLink text='раскрытие структуры' topic={HelpTopic.UI_STRUCTURE_PLANNER} />: по структуре
        типизации можно добавить порождённые конституенты и задать им термины.
      </p>
    )
  }
};
