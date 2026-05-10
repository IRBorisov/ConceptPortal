import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpAPIEn } from './topic.en';
import { HelpAPIFr } from './topic.fr';
import { HelpAPIRu } from './topic.ru';

export function HelpAPI() {
  return <HelpTopicByLocale ru={HelpAPIRu} en={HelpAPIEn} fr={HelpAPIFr} />;
}
