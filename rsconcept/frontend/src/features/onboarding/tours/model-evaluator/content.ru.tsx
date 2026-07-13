import { HelpTopic } from '@/features/help';
import { IconEvaluatorCache } from '@/features/rsmodel/components/icon-evaluator-cache';

import { IconCalculateAll, IconDatabase, IconStatusUnknown } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const modelEvaluatorContentRu: Record<string, TourStepContent> = {
  overview: {
    title: 'Вычисления',
    body: (
      <p>
        Вкладка <TourHelpLink text='вычисления' topic={HelpTopic.UI_MODEL_EVALUATOR} /> проверяет и вычисляет
        произвольные выражения в контексте текущей модели, не изменяя конституенты и их интерпретации — удобно для
        отладки формул и просмотра промежуточных результатов.
      </p>
    )
  },
  tools: {
    title: 'Кэш и пересчёт',
    body: (
      <p>
        <IconEvaluatorCache value={true} className='inline-icon' /> включает или отключает кэш вычислений;{' '}
        <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) пересчитывает всю модель, чтобы
        произвольные выражения видели актуальные значения.
      </p>
    )
  },
  form: {
    title: 'Выражение и результат',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Введите выражение и нажмите кнопку <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='статуса' topic={HelpTopic.UI_EVAL_STATUS} />, чтобы вычислить. Ниже появятся типизация,
          ошибки и значение.
        </p>
        <p>
          Откройте результат в <IconDatabase className='inline-icon' /> просмотрщике значений для структурированного
          разбора.
        </p>
      </div>
    )
  }
};
