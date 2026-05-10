import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSModelBindingEn } from './topic.en';
import { HelpRSModelBindingFr } from './topic.fr';
import { HelpRSModelBindingRu } from './topic.ru';

export function HelpRSModelBinding() {
  return <HelpTopicByLocale ru={HelpRSModelBindingRu} en={HelpRSModelBindingEn} fr={HelpRSModelBindingFr} />;
}
