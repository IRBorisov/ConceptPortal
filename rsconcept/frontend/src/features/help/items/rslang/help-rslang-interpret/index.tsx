import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangInterpretEn } from './topic.en';
import { HelpRSLangInterpretFr } from './topic.fr';
import { HelpRSLangInterpretRu } from './topic.ru';

export function HelpRSLangInterpret() {
  return <HelpTopicByLocale ru={HelpRSLangInterpretRu} en={HelpRSLangInterpretEn} fr={HelpRSLangInterpretFr} />;
}
