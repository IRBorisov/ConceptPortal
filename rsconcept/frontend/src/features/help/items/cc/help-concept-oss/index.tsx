import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptOSSEn } from './topic.en';
import { HelpConceptOSSFr } from './topic.fr';
import { HelpConceptOSSRu } from './topic.ru';

export function HelpConceptOSS() {
  return <HelpTopicByLocale ru={HelpConceptOSSRu} en={HelpConceptOSSEn} fr={HelpConceptOSSFr} />;
}
