import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpOssSidebarEn } from './topic.en';
import { HelpOssSidebarFr } from './topic.fr';
import { HelpOssSidebarRu } from './topic.ru';

export function HelpOssSidebar() {
  return <HelpTopicByLocale ru={HelpOssSidebarRu} en={HelpOssSidebarEn} fr={HelpOssSidebarFr} />;
}
