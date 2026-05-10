import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionQuantorEn } from './topic.en';
import { HelpRSLangExpressionQuantorFr } from './topic.fr';
import { HelpRSLangExpressionQuantorRu } from './topic.ru';

export function HelpRSLangExpressionQuantor() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionQuantorRu} en={HelpRSLangExpressionQuantorEn} fr={HelpRSLangExpressionQuantorFr} />;
}
