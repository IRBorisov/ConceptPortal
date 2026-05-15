import { useTx } from '@/i18n';

import { IconCalculateAll, IconDatabaseOff, IconStatusOK, IconText, IconTree, IconTypeGraph } from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelEvaluatorEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.evaluation')}</h1>
      <p>
        This tab allows you to check and compute arbitrary expressions in the context of the current model without
        modifying constituents or their interpretations. It is useful for debugging formulas, checking typifications,
        and inspecting intermediate results
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>enter a genus-structure expression in the top field</li>
        <li>typification, parse errors, and the computed value are displayed below</li>
        <li>
          to start computation, click the <LinkTopic text='status' topic={HelpTopic.UI_EVAL_STATUS} /> button in the
          centre
        </li>
        <li>
          after the calculation, the number of iterations and cache hits are displayed below (information for debugging)
        </li>
        <li>
          <IconStatusOK className='inline-icon' /> the result can be opened in the value viewer dialog
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> the panel button recomputes the entire model
        </li>
        <li>
          <IconDatabaseOff className='inline-icon' /> the panel button disables the calculation cache
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> display{' '}
          <LinkTopic text='type graph' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> display <LinkTopic text='parse tree' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <IconText className='inline-icon' /> display text or identifiers
        </li>
      </ul>
    </>
  );
}
