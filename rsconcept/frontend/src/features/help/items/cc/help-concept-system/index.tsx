import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptSystemEn } from './topic.en';
import { HelpConceptSystemFr } from './topic.fr';
import { HelpConceptSystemRu } from './topic.ru';

export function HelpConceptSystem() {
  return <HelpTopicByLocale ru={HelpConceptSystemRu} en={HelpConceptSystemEn} fr={HelpConceptSystemFr} />;
}
