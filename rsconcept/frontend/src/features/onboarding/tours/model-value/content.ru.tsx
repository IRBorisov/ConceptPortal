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
        На вкладке <TourHelpLink text='данные модели' topic={HelpTopic.UI_MODEL_VALUE} /> задают и просматривают
        значения конституент. Неопределяемым понятиям задают интерпретацию (для базисных множеств — элементы предметной
        области); производные вычисляются по определениям.
      </p>
    )
  },
  tools: {
    title: 'Вычисление и сохранение',
    body: (
      <>
        <p>
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>Ctrl + Q</kbd>) вычисляет текущую конституенту;{' '}
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) пересчитывает всю модель.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) сохраняет значение;{' '}
          <IconUpload className='inline-icon' /> / <IconDownload className='inline-icon' /> — импорт или экспорт.
        </p>
      </>
    )
  },
  form: {
    title: 'Редактор значения',
    body: (
      <>
        <p>
          Кнопка <IconStatusUnknown className='inline-icon' /> статуса запускает вычисление. Для базисных множеств{' '}
          <TourHelpLink text='диалог привязки' topic={HelpTopic.UI_MODEL_BINDING} /> задаёт элементы предметной области.
        </p>
        <p>
          Подробнее о форматах значений — в руководстве{' '}
          <TourHelpLink text='редактирование значений' topic={HelpTopic.UI_MODEL_VALUE_EDIT} />.
        </p>
      </>
    )
  }
};
