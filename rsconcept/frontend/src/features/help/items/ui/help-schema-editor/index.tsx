import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';

import { HelpSchemaEditorEn } from './topic.en';
import { HelpSchemaEditorFr } from './topic.fr';
import { HelpSchemaEditorRu } from './topic.ru';

export function HelpSchemaEditor() {
  return <HelpTopicByLocale ru={HelpSchemaEditorRu} en={HelpSchemaEditorEn} fr={HelpSchemaEditorFr} />;
}
