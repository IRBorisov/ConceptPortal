import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpAccessEn } from './topic.en';
import { HelpAccessFr } from './topic.fr';
import { HelpAccessRu } from './topic.ru';

export function HelpAccess() {
  return <HelpTopicByLocale ru={HelpAccessRu} en={HelpAccessEn} fr={HelpAccessFr} />;
}
