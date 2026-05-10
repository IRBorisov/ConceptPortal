import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangCorrectEn } from './topic.en';
import { HelpRSLangCorrectFr } from './topic.fr';
import { HelpRSLangCorrectRu } from './topic.ru';

export function HelpRSLangCorrect() {
  return <HelpTopicByLocale ru={HelpRSLangCorrectRu} en={HelpRSLangCorrectEn} fr={HelpRSLangCorrectFr} />;
}
