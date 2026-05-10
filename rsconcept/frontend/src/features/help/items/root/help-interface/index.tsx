import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpInterfaceEn } from './topic.en';
import { HelpInterfaceFr } from './topic.fr';
import { HelpInterfaceRu } from './topic.ru';

export function HelpInterface() {
  return <HelpTopicByLocale ru={HelpInterfaceRu} en={HelpInterfaceEn} fr={HelpInterfaceFr} />;
}
