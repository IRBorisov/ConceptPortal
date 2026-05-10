import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpAssistantEn } from './topic.en';
import { HelpAssistantFr } from './topic.fr';
import { HelpAssistantRu } from './topic.ru';

export function HelpAssistant() {
  return <HelpTopicByLocale ru={HelpAssistantRu} en={HelpAssistantEn} fr={HelpAssistantFr} />;
}
