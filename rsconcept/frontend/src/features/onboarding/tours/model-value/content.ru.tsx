import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconCalculateOne,
  IconDownload,
  IconSave,
  IconStatusUnknown,
  IconUpload
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelValueContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Данные модели',
    body: (
      <p>
        На вкладке <TourHelpLink text='данные модели' topic={HelpTopic.UI_MODEL_VALUE} /> задаются конкретные значения
        базисных множеств и других интерпретируемых конституент. Схема задаёт структуру, модель заполняет её из
        предметной области.
      </p>
    )
  },
  tools: {
    title: 'Вычисление и сохранение',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>Ctrl + Q</kbd>) вычисляет текущую конституенту;{' '}
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) пересчитывает всю модель.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) сохраняет значение;{' '}
          <IconUpload className='inline-icon' /> / <IconDownload className='inline-icon' /> — импорт или экспорт.
        </p>
      </div>
    )
  },
  form: {
    title: 'Редактор значения',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Кнопка <IconStatusUnknown className='inline-icon' /> статуса запускает вычисление; диалог значения удобен для
          структурированного редактирования. Для базисных множеств{' '}
          <TourHelpLink text='диалог привязки' topic={HelpTopic.UI_MODEL_BINDING} /> задаёт элементы предметной области.
        </p>
        <p>
          Также см. <TourHelpLink text='редактирование значений' topic={HelpTopic.UI_MODEL_VALUE_EDIT} />.
        </p>
      </div>
    )
  }
};
