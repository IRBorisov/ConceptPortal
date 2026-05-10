import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptStructuringEn } from './topic.en';
import { HelpConceptStructuringFr } from './topic.fr';
import { HelpConceptStructuringRu } from './topic.ru';

export function HelpConceptStructuring() {
  return <HelpTopicByLocale ru={HelpConceptStructuringRu} en={HelpConceptStructuringEn} fr={HelpConceptStructuringFr} />;
}
