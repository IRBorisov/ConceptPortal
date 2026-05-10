import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSModelCardEn } from './topic.en';
import { HelpRSModelCardFr } from './topic.fr';
import { HelpRSModelCardRu } from './topic.ru';

export function HelpRSModelCard() {
  return <HelpTopicByLocale ru={HelpRSModelCardRu} en={HelpRSModelCardEn} fr={HelpRSModelCardFr} />;
}
