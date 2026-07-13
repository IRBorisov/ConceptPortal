import { HelpTopic } from '@/features/help';

import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт OSS',
    body: (
      <p>
        <TourHelpLink text='Паспорт OSS' topic={HelpTopic.UI_OSS_CARD} /> идентифицирует схему операционного синтеза в
        библиотеке и суммирует её операции. Состав редактируется на вкладке графа.
      </p>
    )
  },
  form: {
    title: 'Заголовок, имя, описание',
    body: (
      <p>
        Заголовок, имя и описание работают как у других паспортов библиотеки. Сохранение —{' '}
        <IconSave className='inline-icon' /> или <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Доступ',
    body: (
      <p>
        Блок <TourHelpLink text='доступа' topic={HelpTopic.ACCESS} /> задаёт политику совместного использования,
        видимость и режим «только чтение» — те же элементы, что у паспортов схемы и модели.
      </p>
    )
  },
  library: {
    title: 'Расположение и владение',
    body: <p>Расположение, владелец, редакторы и даты — под формой, как у других элементов Портала.</p>
  },
  stats: {
    title: 'Панель статистики',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Боковая панель считает операции по типам (блоки, входы, синтез, реплики) и привязанные концептуальные схемы
          (всего, собственные, импортированные).
        </p>
        <p>Состав редактируется на вкладке графа — там же Details открывает полный обзор холста.</p>
      </div>
    )
  },
  graph: {
    title: 'Граф операций',
    body: (
      <p>
        Откройте <TourHelpLink text='граф OSS' topic={HelpTopic.UI_OSS_GRAPH} />, чтобы собирать блоки, входы, синтез и
        реплики. Details — вид, правка, жесты на холсте и панель содержимого.
      </p>
    )
  }
};
