import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptPropagationEn } from './topic.en';
import { HelpConceptPropagationFr } from './topic.fr';
import { HelpConceptPropagationRu } from './topic.ru';

export function HelpConceptPropagation() {
  return <HelpTopicByLocale ru={HelpConceptPropagationRu} en={HelpConceptPropagationEn} fr={HelpConceptPropagationFr} />;
}
