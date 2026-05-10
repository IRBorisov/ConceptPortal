import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSModelMenuEn } from './topic.en';
import { HelpRSModelMenuFr } from './topic.fr';
import { HelpRSModelMenuRu } from './topic.ru';

export function HelpRSModelMenu() {
  return <HelpTopicByLocale ru={HelpRSModelMenuRu} en={HelpRSModelMenuEn} fr={HelpRSModelMenuFr} />;
}
