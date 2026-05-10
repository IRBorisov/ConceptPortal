import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpMainEn } from './topic.en';
import { HelpMainFr } from './topic.fr';
import { HelpMainRu } from './topic.ru';

export function HelpMain() {
  return <HelpTopicByLocale ru={HelpMainRu} en={HelpMainEn} fr={HelpMainFr} />;
}
