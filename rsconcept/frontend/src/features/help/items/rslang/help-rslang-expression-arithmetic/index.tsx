import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionArithmeticEn } from './topic.en';
import { HelpRSLangExpressionArithmeticFr } from './topic.fr';
import { HelpRSLangExpressionArithmeticRu } from './topic.ru';

export function HelpRSLangExpressionArithmetic() {
  return (
    <HelpTopicByLocale ru={HelpRSLangExpressionArithmeticRu} en={HelpRSLangExpressionArithmeticEn} fr={HelpRSLangExpressionArithmeticFr} />
  );
}
