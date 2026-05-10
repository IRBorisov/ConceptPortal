import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionImperativeEn } from './topic.en';
import { HelpRSLangExpressionImperativeFr } from './topic.fr';
import { HelpRSLangExpressionImperativeRu } from './topic.ru';

export function HelpRSLangExpressionImperative() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionImperativeRu} en={HelpRSLangExpressionImperativeEn} fr={HelpRSLangExpressionImperativeFr} />;
}
