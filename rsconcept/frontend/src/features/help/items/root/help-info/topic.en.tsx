import { useTx } from '@/i18n';

import { Subtopics } from '../../../components/subtopics';
import { HelpTopic } from '../../../models/help-topic';

export function HelpInfoEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.documentation')}</h1>
      <p>This section collects documents that define the legal status of the Portal.</p>

      <Subtopics headTopic={HelpTopic.INFO} />
    </>
  );
}
