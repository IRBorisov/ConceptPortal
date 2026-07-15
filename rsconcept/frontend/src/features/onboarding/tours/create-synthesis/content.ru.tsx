import { HelpTopic } from '@/features/help';

import { IconConsolidation, IconExecute, IconSynthesis } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const createSynthesisContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Создание синтеза',
    body: (
      <p>
        Диалог добавляет операцию <IconSynthesis className='inline-icon' />{' '}
        <TourHelpLink text='синтеза' topic={HelpTopic.CC_SYNTHESIS} /> в ОР. Сначала вкладка <b>Аргументы</b>, затем{' '}
        <b>Отождествления</b> (таблица идентификации), после чего создайте операцию.
      </p>
    )
  },
  arguments: {
    title: 'Операция и аргументы',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Заполните название, обозначение, при необходимости родительский блок и описание. Затем выберите
          операции-аргументы, чьи схемы будут объединены — обычно загрузки или предыдущие синтезы.
        </p>
        <p>Нельзя выбрать и реплику, и её оригинал; несовместимые пары из списка исключены.</p>
      </div>
    )
  },
  substitutions: {
    title: 'Таблица отождествлений',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          На вкладке <b>Отождествления</b> заполните{' '}
          <TourHelpLink text='таблицу идентификации' topic={HelpTopic.UI_SUBSTITUTIONS} />: сопоставьте конституенты
          схем-аргументов, которые должны считаться одним понятием. Сообщения под таблицей показывают ошибки и подсказки
          совпадений.
        </p>
        <p>
          При <IconConsolidation className='inline-icon' /> ромбовидном синтезе (общие предки) аккуратно добавьте
          дубликаты. Создание выполняет операцию один раз, чтобы далее работало{' '}
          <TourHelpLink text='распространение изменений' topic={HelpTopic.CC_PROPAGATION} /> — как активация синтеза{' '}
          <IconExecute className='inline-icon icon-green' />.
        </p>
      </div>
    )
  }
};
