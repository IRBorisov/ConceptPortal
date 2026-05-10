import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpTypeGraphEn } from './topic.en';
import { HelpTypeGraphFr } from './topic.fr';
import { HelpTypeGraphRu } from './topic.ru';

export function HelpTypeGraph() {
  return <HelpTopicByLocale ru={HelpTypeGraphRu} en={HelpTypeGraphEn} fr={HelpTypeGraphFr} />;
}
