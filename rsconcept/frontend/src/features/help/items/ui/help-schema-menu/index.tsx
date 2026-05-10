import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpSchemaMenuEn } from './topic.en';
import { HelpSchemaMenuFr } from './topic.fr';
import { HelpSchemaMenuRu } from './topic.ru';

export function HelpSchemaMenu() {
  return <HelpTopicByLocale ru={HelpSchemaMenuRu} en={HelpSchemaMenuEn} fr={HelpSchemaMenuFr} />;
}
