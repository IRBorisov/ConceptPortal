import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconOwner, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const schemaPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт схемы',
    body: (
      <p>
        <TourHelpLink text='Паспорт схемы' topic={HelpTopic.UI_SCHEMA_CARD} /> хранит идентификацию концептуальной схемы
        в библиотеке: название, доступ, версии и сводную статистику.
      </p>
    )
  },
  form: {
    title: 'Название, сокращение, описание',
    body: (
      <p>
        Название видно в списках, сокращение — короткий идентификатор в библиотеке, описание фиксирует предметную
        область. Сохранение — <IconSave className='inline-icon' /> или <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  versions: {
    title: 'Версии',
    body: (
      <p>
        У схемы могут быть именованные <TourHelpLink text='версии' topic={HelpTopic.VERSIONS} />. Активную версию
        выбирают в селекторе; создание и правка — в панели над ним.
      </p>
    )
  },
  access: {
    title: 'Доступ',
    body: (
      <p>
        Блок <TourHelpLink text='доступа' topic={HelpTopic.ACCESS} /> задаёт политику совместного использования,
        видимость в библиотеке и режим «только чтение» для редакторов.
      </p>
    )
  },
  library: {
    title: 'Расположение и владение',
    body: (
      <p>
        Под формой — метаданные библиотеки: расположение (<IconFolderEdit className='inline-icon' />
        ), владелец (
        <IconOwner className='inline-icon' />
        ), редакторы и даты создания/обновления.
      </p>
    )
  },
  stats: {
    title: 'Панель статистики',
    body: (
      <>
        <p>
          Боковая панель суммирует схему: число конституент, аксиоматическое ядро и тело теории, а также показатели
          корректности (ошибки и невычислимые определения).
        </p>
        <p>
          Раскройте категорию для разбивки — например базисные или константные множества, аксиомы, термы, текстовые
          определения и конвенции.
        </p>
      </>
    )
  }
};
