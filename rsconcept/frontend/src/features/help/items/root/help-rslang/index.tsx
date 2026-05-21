import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangEn } from './topic.en';
import { HelpRSLangFr } from './topic.fr';
import { HelpRSLangRu } from './topic.ru';

export function HelpRSLang() {
  return <HelpTopicByLocale ru={HelpRSLangRu} en={HelpRSLangEn} fr={HelpRSLangFr} />;
}
