import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpSubstitutionsEn } from './topic.en';
import { HelpSubstitutionsFr } from './topic.fr';
import { HelpSubstitutionsRu } from './topic.ru';

export function HelpSubstitutions() {
  return <HelpTopicByLocale ru={HelpSubstitutionsRu} en={HelpSubstitutionsEn} fr={HelpSubstitutionsFr} />;
}
