import { HelpTopic } from '@/features/help';

import { IconConsolidation, IconExecute, IconSynthesis } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const createSynthesisContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Синтез',
    body: (
      <p>
        Диалог добавляет операцию <IconSynthesis className='inline-icon' />{' '}
        <TourHelpLink text='синтеза' topic={HelpTopic.CC_SYNTHESIS} /> в ОСС. Сначала вкладка <b>Аргументы</b>, затем{' '}
        <b>Отождествления</b> (таблица отождествлений), после чего нажмите <b>Создать</b>.
      </p>
    )
  },
  arguments: {
    title: 'Операция и аргументы',
    body: (
      <>
        <p>
          Заполните название, <b>сокращение</b>, при необходимости родительский блок и описание. Затем в блоке{' '}
          <b>Выбор аргументов</b> отметьте операции, чьи схемы будут объединены — обычно загрузки или предыдущие синтезы.
        </p>
        <p>Нельзя выбрать и реплику, и её оригинал; несовместимые пары из списка исключены.</p>
      </>
    )
  },
  substitutions: {
    title: 'Таблица отождествлений',
    body: (
      <>
        <p>
          На вкладке <b>Отождествления</b> заполните{' '}
          <TourHelpLink text='таблицу отождествлений' topic={HelpTopic.UI_SUBSTITUTIONS} /> конституент схем-аргументов,
          которые должны считаться одной конституентой. Под таблицей — результат проверки; в строках —{' '}
          <b>предложения</b> (принять или игнорировать).
        </p>
        <p>
          При <IconConsolidation className='inline-icon' /> ромбовидном синтезе (общие предки) аккуратно добавьте
          дубликаты конституент. После создания синтез в графе нужно <b>активировать</b>{' '}
          <IconExecute className='inline-icon icon-green' /> для{' '}
          <TourHelpLink text='распространения изменений' topic={HelpTopic.CC_PROPAGATION} />.
        </p>
      </>
    )
  }
};
