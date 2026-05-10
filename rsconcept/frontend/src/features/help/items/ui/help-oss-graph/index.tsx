import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpOssGraphEn } from './topic.en';
import { HelpOssGraphFr } from './topic.fr';
import { HelpOssGraphRu } from './topic.ru';

export function HelpOssGraph() {
  return <HelpTopicByLocale ru={HelpOssGraphRu} en={HelpOssGraphEn} fr={HelpOssGraphFr} />;
}
