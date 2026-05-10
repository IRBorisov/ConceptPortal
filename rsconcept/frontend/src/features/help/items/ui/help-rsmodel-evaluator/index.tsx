import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSModelEvaluatorEn } from './topic.en';
import { HelpRSModelEvaluatorFr } from './topic.fr';
import { HelpRSModelEvaluatorRu } from './topic.ru';

export function HelpRSModelEvaluator() {
  return <HelpTopicByLocale ru={HelpRSModelEvaluatorRu} en={HelpRSModelEvaluatorEn} fr={HelpRSModelEvaluatorFr} />;
}
