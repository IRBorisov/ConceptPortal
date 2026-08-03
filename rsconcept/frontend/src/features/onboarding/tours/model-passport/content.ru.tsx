import { HelpTopic } from '@/features/help';

import { IconFolderEdit, IconOwner, IconRSForm, IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelPassportContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Паспорт',
    body: (
      <p>
        Вкладка «Паспорт» открывает <TourHelpLink text='паспорт модели' topic={HelpTopic.UI_MODEL_CARD} /> —
        карточку концептуальной модели, привязанной к схеме: название, доступ, ссылку на схему и сводную статистику.
      </p>
    )
  },
  form: {
    title: 'Название, сокращение, описание',
    body: (
      <p>
        Здесь правятся название, сокращение и описание модели. Атрибуты связанной схемы на этой форме не меняются.
        Сохранение — «Сохранить изменения» (<IconSave className='inline-icon' />) или <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  access: {
    title: 'Доступ',
    body: (
      <p>
        Справа от сокращения строка <TourHelpLink text='«Доступ»' topic={HelpTopic.ACCESS} />: политика доступа
        (Личный / Защищенный / Открытый), видимость в библиотеке и разрешение или запрет изменения для редакторов.
      </p>
    )
  },
  schema: {
    title: 'Связанная схема',
    body: (
      <p>
        Ссылка с иконкой <IconRSForm className='inline-icon' /> и сокращением схемы открывает исходную концептуальную
        схему, на конституентах которой строятся данные и вычисления модели.
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
          Боковая панель делится на «Содержание» и «Схема» (структура связанной КС), «Корректность» (проблемы схемы) и
          «Модель» (модельные проблемы: неопределяемые без интерпретации, нарушенные аксиомы, неверные данные, ошибки
          вычисления и пустые значения термов).
        </p>
        <p>Раскройте категории, чтобы увидеть разбивку по типам.</p>
      </>
    )
  }
};
