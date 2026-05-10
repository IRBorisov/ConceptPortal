import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptEn } from './topic.en';
import { HelpConceptFr } from './topic.fr';
import { HelpConceptRu } from './topic.ru';

export function HelpConcept() {
  return <HelpTopicByLocale ru={HelpConceptRu} en={HelpConceptEn} fr={HelpConceptFr} />;
}
