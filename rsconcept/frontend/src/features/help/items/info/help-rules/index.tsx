import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRulesEn } from './topic.en';
import { HelpRulesFr } from './topic.fr';
import { HelpRulesRu } from './topic.ru';

export function HelpRules() {
  return <HelpTopicByLocale ru={HelpRulesRu} en={HelpRulesEn} fr={HelpRulesFr} />;
}
