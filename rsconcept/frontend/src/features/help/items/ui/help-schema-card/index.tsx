import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpSchemaCardEn } from './topic.en';
import { HelpSchemaCardFr } from './topic.fr';
import { HelpSchemaCardRu } from './topic.ru';

export function HelpSchemaCard() {
  return <HelpTopicByLocale ru={HelpSchemaCardRu} en={HelpSchemaCardEn} fr={HelpSchemaCardFr} />;
}
