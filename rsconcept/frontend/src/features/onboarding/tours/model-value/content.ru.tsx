import { HelpTopic } from '@/features/help';

import { IconCalculateAll, IconCalculateOne, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';
const calculateHotkey = isMac() ? 'Cmd + Q' : 'Ctrl + Q';

export const modelValueContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Данные',
    body: (
      <p>
        Вкладка <TourHelpLink text='Данные' topic={HelpTopic.UI_MODEL_VALUE} /> (в справке — данные модели) задаёт и
        показывает значения конституент. Выберите конституенту в списке слева. Неопределяемым понятиям задают
        интерпретацию (для базисных множеств — элементы предметной области); производные вычисляются по определениям. В
        отличие от вкладки «Расчет», здесь правят значения конституент, а не произвольные выражения.
      </p>
    )
  },
  tools: {
    title: 'Вычисление и сохранение',
    body: (
      <>
        <p>
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) пересчитывает всю модель;{' '}
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>{calculateHotkey}</kbd>) вычисляет текущую
          конституенту — кнопка неактивна при несохранённых изменениях.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>{saveHotkey}</kbd>) сохраняет изменения формы (термин, определения,
          значение).
        </p>
      </>
    )
  },
  form: {
    title: 'Редактор значения',
    body: (
      <>
        <p>
          Кнопки «Импорт» и «Экспорт» загружают или выгружают значение текущей конституенты (буфер обмена или JSON).
        </p>
        <p>
          Нажмите полосу статуса («Не вычислено» / …) — «Сохранить и вычислить». Для базисных множеств{' '}
          <TourHelpLink text='диалог базовой интерпретации' topic={HelpTopic.UI_MODEL_BINDING} /> задаёт элементы
          предметной области; для структур — диалог редактирования значения. Если фокус в поле формального определения,{' '}
          <kbd>{calculateHotkey}</kbd> проверяет выражение, а не значение.
        </p>
        <p>
          Подробнее о форматах значений — в руководстве{' '}
          <TourHelpLink text='редактирование значений' topic={HelpTopic.UI_MODEL_VALUE_EDIT} />.
        </p>
      </>
    )
  }
};
