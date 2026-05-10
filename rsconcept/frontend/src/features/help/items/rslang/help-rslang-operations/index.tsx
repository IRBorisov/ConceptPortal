import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangOperationsEn } from './topic.en';
import { HelpRSLangOperationsFr } from './topic.fr';
import { HelpRSLangOperationsRu } from './topic.ru';

export function HelpRSLangOperations() {
  return <HelpTopicByLocale ru={HelpRSLangOperationsRu} en={HelpRSLangOperationsEn} fr={HelpRSLangOperationsFr} />;
}
