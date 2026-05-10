import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionRecursiveEn } from './topic.en';
import { HelpRSLangExpressionRecursiveFr } from './topic.fr';
import { HelpRSLangExpressionRecursiveRu } from './topic.ru';

export function HelpRSLangExpressionRecursive() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionRecursiveRu} en={HelpRSLangExpressionRecursiveEn} fr={HelpRSLangExpressionRecursiveFr} />;
}
