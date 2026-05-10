import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpInfoEn } from './topic.en';
import { HelpInfoFr } from './topic.fr';
import { HelpInfoRu } from './topic.ru';

export function HelpInfo() {
  return <HelpTopicByLocale ru={HelpInfoRu} en={HelpInfoEn} fr={HelpInfoFr} />;
}
