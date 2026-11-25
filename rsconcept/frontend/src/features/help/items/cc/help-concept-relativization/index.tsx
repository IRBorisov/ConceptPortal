import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpConceptRelativizationEn } from './topic.en';
import { HelpConceptRelativizationFr } from './topic.fr';
import { HelpConceptRelativizationRu } from './topic.ru';

export function HelpConceptRelativization() {
  return (
    <HelpTopicByLocale
      ru={HelpConceptRelativizationRu}
      en={HelpConceptRelativizationEn}
      fr={HelpConceptRelativizationFr}
    />
  );
}
