import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpThesaurusEn } from './topic.en';
import { HelpThesaurusFr } from './topic.fr';
import { HelpThesaurusRu } from './topic.ru';

export function HelpThesaurus() {
  return <HelpTopicByLocale ru={HelpThesaurusRu} en={HelpThesaurusEn} fr={HelpThesaurusFr} />;
}
