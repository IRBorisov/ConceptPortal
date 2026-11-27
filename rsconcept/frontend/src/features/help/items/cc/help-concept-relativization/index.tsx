import { useTx } from '@/i18n';

import { HelpTopicByLocale } from '@/features/help/components/help-topic-by-locale';
import { LinkTopic } from '@/features/help/components/link-topic';
import { HelpTopic } from '@/features/help/models/help-topic';

import { HelpConceptRelativizationEn } from './topic.en';
import { HelpConceptRelativizationFr } from './topic.fr';
import { HelpConceptRelativizationRu } from './topic.ru';

export function HelpConceptRelativization() {
  const tx = useTx();
  return (
    <>
      <HelpTopicByLocale
        ru={HelpConceptRelativizationRu}
        en={HelpConceptRelativizationEn}
        fr={HelpConceptRelativizationFr}
      />
      <p>
        <LinkTopic text={tx('tx.lang.thesaurus.hint')} topic={HelpTopic.THESAURUS} />
      </p>
    </>
  );
}
