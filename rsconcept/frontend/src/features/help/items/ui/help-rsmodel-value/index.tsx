import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSModelValueEn } from './topic.en';
import { HelpRSModelValueFr } from './topic.fr';
import { HelpRSModelValueRu } from './topic.ru';

export function HelpRSModelValue() {
  return <HelpTopicByLocale ru={HelpRSModelValueRu} en={HelpRSModelValueEn} fr={HelpRSModelValueFr} />;
}
