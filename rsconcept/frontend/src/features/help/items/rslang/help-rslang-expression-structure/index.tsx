import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpRSLangExpressionStructureEn } from './topic.en';
import { HelpRSLangExpressionStructureFr } from './topic.fr';
import { HelpRSLangExpressionStructureRu } from './topic.ru';

export function HelpRSLangExpressionStructure() {
  return <HelpTopicByLocale ru={HelpRSLangExpressionStructureRu} en={HelpRSLangExpressionStructureEn} fr={HelpRSLangExpressionStructureFr} />;
}
