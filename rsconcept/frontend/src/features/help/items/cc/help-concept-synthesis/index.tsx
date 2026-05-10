import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptSynthesisEn } from './topic.en';
import { HelpConceptSynthesisFr } from './topic.fr';
import { HelpConceptSynthesisRu } from './topic.ru';

export function HelpConceptSynthesis() {
  return <HelpTopicByLocale ru={HelpConceptSynthesisRu} en={HelpConceptSynthesisEn} fr={HelpConceptSynthesisFr} />;
}
