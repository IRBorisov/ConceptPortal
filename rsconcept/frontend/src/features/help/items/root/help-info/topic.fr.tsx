import { useTx } from '@/i18n';

import { Subtopics } from '../../../components/subtopics';
import { HelpTopic } from '../../../models/help-topic';

export function HelpInfoFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.documentation')}</h1>
      <p>Cette rubrique rassemble les documents qui fixent le statut juridique du portail.</p>

      <Subtopics headTopic={HelpTopic.INFO} />
    </>
  );
}
