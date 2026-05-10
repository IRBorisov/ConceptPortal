import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpSchemaListEn } from './topic.en';
import { HelpSchemaListFr } from './topic.fr';
import { HelpSchemaListRu } from './topic.ru';

export function HelpSchemaList() {
  return <HelpTopicByLocale ru={HelpSchemaListRu} en={HelpSchemaListEn} fr={HelpSchemaListFr} />;
}
