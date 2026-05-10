import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionParameterEn } from './topic.en';
import { HelpRSLangExpressionParameterFr } from './topic.fr';
import { HelpRSLangExpressionParameterRu } from './topic.ru';

export function HelpRSLangExpressionParameter() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionParameterRu} en={HelpRSLangExpressionParameterEn} fr={HelpRSLangExpressionParameterFr} />;
}
