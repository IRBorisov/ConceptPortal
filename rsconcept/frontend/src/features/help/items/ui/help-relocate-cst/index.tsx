import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRelocateCstEn } from './topic.en';
import { HelpRelocateCstFr } from './topic.fr';
import { HelpRelocateCstRu } from './topic.ru';

export function HelpRelocateCst() {
  return <HelpTopicByLocale ru={HelpRelocateCstRu} en={HelpRelocateCstEn} fr={HelpRelocateCstFr} />;
}
