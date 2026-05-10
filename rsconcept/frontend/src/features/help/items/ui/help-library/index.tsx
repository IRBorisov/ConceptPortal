import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpLibraryEn } from './topic.en';
import { HelpLibraryFr } from './topic.fr';
import { HelpLibraryRu } from './topic.ru';

export function HelpLibrary() {
  return <HelpTopicByLocale ru={HelpLibraryRu} en={HelpLibraryEn} fr={HelpLibraryFr} />;
}
