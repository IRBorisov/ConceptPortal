import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangTypificationEn } from './topic.en';
import { HelpRSLangTypificationFr } from './topic.fr';
import { HelpRSLangTypificationRu } from './topic.ru';

export function HelpRSLangTypification() {
  return <HelpTopicByLocale ru={HelpRSLangTypificationRu} en={HelpRSLangTypificationEn} fr={HelpRSLangTypificationFr} />;
}
