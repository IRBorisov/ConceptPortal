import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconFolderOpened, IconOwner, IconReset, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт ОСС',
    body: (
      <>
        <p>
          <TourHelpLink text='Паспорт ОСС' topic={HelpTopic.UI_OSS_CARD} /> описывает операционную схему (ОСС) в
          библиотеке: название, доступ и сводную статистику операций.
        </p>
        <p>Граф операций — на вкладке «Граф» (отдельный тур).</p>
      </>
    )
  },
  form: {
    title: 'Название, сокращение, описание',
    body: (
      <p>
        Название видно в списках, сокращение — короткий идентификатор в библиотеке, описание фиксирует предметную
        область. Сохранение — <IconSave className='inline-icon' /> или <kbd>Ctrl + S</kbd>; сброс —{' '}
        <IconReset className='inline-icon' />.
      </p>
    )
  },
  access: {
    title: 'Доступ',
    body: (
      <p>
        <TourHelpLink text='Доступ' topic={HelpTopic.ACCESS} /> задаёт политику доступа, видимость в библиотеке и режим
        «только чтение» для редакторов.
      </p>
    )
  },
  library: {
    title: 'Расположение и владение',
    body: (
      <p>
        Под формой — расположение в библиотеке (<IconFolderEdit className='inline-icon' />
        ), открытие в библиотеке (<IconFolderOpened className='inline-icon' />
        ), владелец (<IconOwner className='inline-icon' />
        ), редакторы и даты создания/обновления.
      </p>
    )
  },
  stats: {
    title: 'Содержание и прикреплённые схемы',
    body: (
      <>
        <p>
          В разделе «Содержание» откройте «Подробнее», чтобы увидеть число операций каждого типа. Строка «Релятивизация»
          показывает число операций релятивизации.
        </p>
        <p>
          В разделе «Прикреплённые схемы» приведены общее число схем и разбивка по собственным и импортированным. Под
          «Подробнее» строка «Релятивиз. схемы» показывает число полученных релятивизацией КС.
        </p>
      </>
    )
  }
};
