import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpCstAttributesEn } from './topic.en';
import { HelpCstAttributesFr } from './topic.fr';
import { HelpCstAttributesRu } from './topic.ru';

export function HelpCstAttributes() {
  return <HelpTopicByLocale ru={HelpCstAttributesRu} en={HelpCstAttributesEn} fr={HelpCstAttributesFr} />;
}
