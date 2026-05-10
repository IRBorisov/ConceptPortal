import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptRelationsEn } from './topic.en';
import { HelpConceptRelationsFr } from './topic.fr';
import { HelpConceptRelationsRu } from './topic.ru';

export function HelpConceptRelations() {
  return <HelpTopicByLocale ru={HelpConceptRelationsRu} en={HelpConceptRelationsEn} fr={HelpConceptRelationsFr} />;
}
