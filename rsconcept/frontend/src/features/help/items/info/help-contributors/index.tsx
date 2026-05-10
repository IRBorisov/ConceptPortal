import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpContributorsEn } from './topic.en';
import { HelpContributorsFr } from './topic.fr';
import { HelpContributorsRu } from './topic.ru';

export function HelpContributors() {
  return <HelpTopicByLocale ru={HelpContributorsRu} en={HelpContributorsEn} fr={HelpContributorsFr} />;
}
