import { useTx } from '@/i18n';

import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpStructurePlannerEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.expandStructure.noun')}</h1>
      <p>
        A full-screen dialog for working with the typification structure of a selected{' '}
        <LinkTopic text='constituent' topic={HelpTopic.CC_CONSTITUENTA} />. An operation graph (small and large
        projections, set-sum) is built from the typification tree. Nodes correspond to structural elements; for each one
        its formal definition, designation (name), and <LinkTopic text='term' topic={HelpTopic.CC_CONSTITUENTA} /> are
        displayed.
      </p>
      <p>
        The dialog opens from the "Concept" tab via the "Typification" button (if the constituent has a structure) or
        from the schema menu via the "Generate structure" command.
      </p>

      <h2>{tx('tx.graph')}</h2>
      <ul>
        <li>click on a node to select a structural element</li>
        <li>if a constituent already exists for it — it is substituted; otherwise a name for a new one is suggested</li>
        <li>the root of the graph is the open constituent (for a term-function — the result type)</li>
        <li>
          if the constituent is <LinkTopic text='generated' topic={HelpTopic.CC_RELATIONS} />, the root is the structure
          of the basis
        </li>
      </ul>

      <h2>Top panel</h2>
      <ul>
        <li>on the left — formal definition of the selected element</li>
        <li>text references are supported in the term field</li>
        <li>
          in the term field: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd> — save the term or create the constituent
        </li>
      </ul>
    </>
  );
}
