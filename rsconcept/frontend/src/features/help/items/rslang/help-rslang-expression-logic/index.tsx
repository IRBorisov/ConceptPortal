import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionLogicEn } from './topic.en';
import { HelpRSLangExpressionLogicFr } from './topic.fr';
import { HelpRSLangExpressionLogicRu } from './topic.ru';

export function HelpRSLangExpressionLogic() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionLogicRu} en={HelpRSLangExpressionLogicEn} fr={HelpRSLangExpressionLogicFr} />;
}
