import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpTerminologyControlEn } from './topic.en';
import { HelpTerminologyControlFr } from './topic.fr';
import { HelpTerminologyControlRu } from './topic.ru';

export function HelpTerminologyControl() {
  return <HelpTopicByLocale ru={HelpTerminologyControlRu} en={HelpTerminologyControlEn} fr={HelpTerminologyControlFr} />;
}
