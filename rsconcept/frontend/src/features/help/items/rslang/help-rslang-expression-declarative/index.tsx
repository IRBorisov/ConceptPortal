import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionDeclarativeEn } from './topic.en';
import { HelpRSLangExpressionDeclarativeFr } from './topic.fr';
import { HelpRSLangExpressionDeclarativeRu } from './topic.ru';

export function HelpRSLangExpressionDeclarative() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionDeclarativeRu} en={HelpRSLangExpressionDeclarativeEn} fr={HelpRSLangExpressionDeclarativeFr} />;
}
