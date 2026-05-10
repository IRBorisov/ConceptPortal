import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangTemplatesEn } from './topic.en';
import { HelpRSLangTemplatesFr } from './topic.fr';
import { HelpRSLangTemplatesRu } from './topic.ru';

export function HelpRSLangTemplates() {
  return <HelpTopicByLocale ru={HelpRSLangTemplatesRu} en={HelpRSLangTemplatesEn} fr={HelpRSLangTemplatesFr} />;
}
