import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpFormulaTreeEn } from './topic.en';
import { HelpFormulaTreeFr } from './topic.fr';
import { HelpFormulaTreeRu } from './topic.ru';

export function HelpFormulaTree() {
  return <HelpTopicByLocale ru={HelpFormulaTreeRu} en={HelpFormulaTreeEn} fr={HelpFormulaTreeFr} />;
}
