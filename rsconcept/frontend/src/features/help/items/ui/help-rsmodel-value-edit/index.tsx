import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSModelValueEditEn } from './topic.en';
import { HelpRSModelValueEditFr } from './topic.fr';
import { HelpRSModelValueEditRu } from './topic.ru';

export function HelpRSModelValueEdit() {
  return <HelpTopicByLocale ru={HelpRSModelValueEditRu} en={HelpRSModelValueEditEn} fr={HelpRSModelValueEditFr} />;
}
