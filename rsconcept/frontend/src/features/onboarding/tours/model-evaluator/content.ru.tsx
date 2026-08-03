import { HelpTopic } from '@/features/help';
import { IconEvaluatorCache } from '@/features/rsmodel/components/icon-evaluator-cache';

import { IconCalculateAll, IconStatusUnknown } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelEvaluatorContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Расчет',
    body: (
      <p>
        Вкладка <TourHelpLink text='Расчет' topic={HelpTopic.UI_MODEL_EVALUATOR} /> проверяет и вычисляет
        произвольные родоструктурные выражения (<TourHelpLink text='ЯРЭ' topic={HelpTopic.RSLANG} />) на данных
        модели. В отличие от вкладки <TourHelpLink text='Данные' topic={HelpTopic.UI_MODEL_VALUE} />, здесь не
        редактируют значения конституент — данные модели не меняются.
      </p>
    )
  },
  tools: {
    title: 'Кэш и пересчёт',
    body: (
      <p>
        <IconEvaluatorCache value={true} className='inline-icon' /> отключает кэш вычислений (при включённом кэше
        иконка цветная); <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) пересчитывает
        всю модель, чтобы выражения видели актуальные значения.
      </p>
    )
  },
  form: {
    title: 'Выражение и результат',
    body: (
      <>
        <p>
          Введите выражение в поле «Формальное определение» и нажмите{' '}
          <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='Не вычислено' topic={HelpTopic.UI_EVAL_STATUS} /> (или <kbd>Ctrl + Q</kbd>). Сверху
          обновится типизация, в поле выражения — ошибки, ниже — вычисленное значение.
        </p>
        <p>
          Кнопка «Просмотр значения» открывает структурированный разбор; для некоторых типов она недоступна.
        </p>
      </>
    )
  }
};
