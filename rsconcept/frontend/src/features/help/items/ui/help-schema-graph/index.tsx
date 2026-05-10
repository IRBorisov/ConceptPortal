import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpSchemaGraphEn } from './topic.en';
import { HelpSchemaGraphFr } from './topic.fr';
import { HelpSchemaGraphRu } from './topic.ru';

export function HelpSchemaGraph() {
  return <HelpTopicByLocale ru={HelpSchemaGraphRu} en={HelpSchemaGraphEn} fr={HelpSchemaGraphFr} />;
}
