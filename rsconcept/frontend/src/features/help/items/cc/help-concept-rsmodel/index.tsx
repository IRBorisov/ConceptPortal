import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptRSModelEn } from './topic.en';
import { HelpConceptRSModelFr } from './topic.fr';
import { HelpConceptRSModelRu } from './topic.ru';

export function HelpConceptRSModel() {
  return <HelpTopicByLocale ru={HelpConceptRSModelRu} en={HelpConceptRSModelEn} fr={HelpConceptRSModelFr} />;
}
