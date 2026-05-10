import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionSetEn } from './topic.en';
import { HelpRSLangExpressionSetFr } from './topic.fr';
import { HelpRSLangExpressionSetRu } from './topic.ru';

export function HelpRSLangExpressionSet() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionSetRu} en={HelpRSLangExpressionSetEn} fr={HelpRSLangExpressionSetFr} />;
}
