import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangLiteralsEn } from './topic.en';
import { HelpRSLangLiteralsFr } from './topic.fr';
import { HelpRSLangLiteralsRu } from './topic.ru';

export function HelpRSLangLiterals() {
  return <HelpTopicByLocale ru={HelpRSLangLiteralsRu} en={HelpRSLangLiteralsEn} fr={HelpRSLangLiteralsFr} />;
}
