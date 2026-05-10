import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpExteorEn } from './topic.en';
import { HelpExteorFr } from './topic.fr';
import { HelpExteorRu } from './topic.ru';

export function HelpExteor() {
  return <HelpTopicByLocale ru={HelpExteorRu} en={HelpExteorEn} fr={HelpExteorFr} />;
}
