import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSModelListEn } from './topic.en';
import { HelpRSModelListFr } from './topic.fr';
import { HelpRSModelListRu } from './topic.ru';

export function HelpRSModelList() {
  return <HelpTopicByLocale ru={HelpRSModelListRu} en={HelpRSModelListEn} fr={HelpRSModelListFr} />;
}
