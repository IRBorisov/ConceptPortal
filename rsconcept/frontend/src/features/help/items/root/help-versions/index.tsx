import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpVersionsEn } from './topic.en';
import { HelpVersionsFr } from './topic.fr';
import { HelpVersionsRu } from './topic.ru';

export function HelpVersions() {
  return <HelpTopicByLocale ru={HelpVersionsRu} en={HelpVersionsEn} fr={HelpVersionsFr} />;
}
