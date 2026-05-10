import { useTx } from '@/i18n';

import { Subtopics } from '../components/subtopics';
import { HelpTopic } from '../models/help-topic';

export function HelpInfo() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.documentation')}</h1>
      <p>Раздел содержит различные документы, задающие правовой статус Портала.</p>

      <Subtopics headTopic={HelpTopic.INFO} />
    </>
  );
}
