import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpOssCardEn } from './topic.en';
import { HelpOssCardFr } from './topic.fr';
import { HelpOssCardRu } from './topic.ru';

export function HelpOssCard() {
  return <HelpTopicByLocale ru={HelpOssCardRu} en={HelpOssCardEn} fr={HelpOssCardFr} />;
}
