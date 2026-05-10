import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpStructurePlannerEn } from './topic.en';
import { HelpStructurePlannerFr } from './topic.fr';
import { HelpStructurePlannerRu } from './topic.ru';

export function HelpStructurePlanner() {
  return <HelpTopicByLocale ru={HelpStructurePlannerRu} en={HelpStructurePlannerEn} fr={HelpStructurePlannerFr} />;
}
