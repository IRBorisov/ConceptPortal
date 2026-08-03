import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconFolderOpened, IconOwner, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const schemaPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт',
    body: (
      <p>
        Вкладка <TourHelpLink text='Паспорт' topic={HelpTopic.UI_SCHEMA_CARD} /> содержит метаданные концептуальной
        схемы в библиотеке: название, доступ, версии и сводную статистику.
      </p>
    )
  },
  form: {
    title: 'Название, сокращение, описание',
    body: (
      <p>
        Название видно в списках, сокращение — короткий идентификатор в библиотеке, описание — источники, пояснения и
        примечания. Сохранение — <IconSave className='inline-icon' /> или <kbd>Ctrl + S</kbd> / <kbd>Cmd + S</kbd>.
      </p>
    )
  },
  versions: {
    title: 'Версия',
    body: (
      <p>
        У схемы могут быть именованные <TourHelpLink text='версии' topic={HelpTopic.VERSIONS} />. Активную версию
        выбирают в списке; над полем «Версия» — иконки создания версии, редактирования списка и отката.
      </p>
    )
  },
  access: {
    title: 'Доступ',
    body: (
      <p>
        Блок <TourHelpLink text='доступа' topic={HelpTopic.ACCESS} /> включает три элемента: политику (Личный /
        Защищенный / Открытый), видимость в списке библиотеки и разрешение или запрет изменения.
      </p>
    )
  },
  library: {
    title: 'Расположение и владение',
    body: (
      <p>
        Под формой — метаданные библиотеки: открыть в библиотеке (<IconFolderOpened className='inline-icon' />
        ), расположение (<IconFolderEdit className='inline-icon' />
        ), владелец (
        <IconOwner className='inline-icon' />
        ), редакторы и даты. У производных схем расположение и владелец наследуются от ОСС.
      </p>
    )
  },
  stats: {
    title: 'Сводка по схеме',
    body: (
      <>
        <p>
          Боковая панель суммирует схему по блокам «Содержание», «Аксиоматическое ядро», «Тело теории» и «Корректность»
          (ошибки и невычислимые определения).
        </p>
        <p>
          Раскройте категорию для разбивки — например базисное и константное множество, родовая структура, аксиома; или
          термины, текстовые определения и конвенции.
        </p>
      </>
    )
  }
};
