import { useTx } from '@/i18n';

import { IconNewItem } from '@/components/icons';
import { isMac } from '@/utils/utils';

export function HelpFormulaTreeEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.ast')}</h1>
      <p>The syntax parse tree reflects the structure of the expression.</p>

      <ul>
        <li>Text in a tree node corresponds to a language element</li>
        <li>Hovering a node highlights the expression fragment and shows typing</li>
        <li>
          <kbd>Space</kbd> — pan the view without hovering nodes
        </li>
        <li>
          <IconNewItem className='inline-icon' size='1rem' /> <kbd>Q</kbd> — extract the selected subexpression into a
          new constituent
        </li>
        <li>
          in the extraction panel: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd> — confirm extraction
        </li>
      </ul>

      <h2>Node kinds</h2>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-green' />
        identifier declaration
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-teal' />
        global identifier
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-orange' />
        logical expression
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-blue' />
        typed expression
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-red' />
        assignment and iteration
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-secondary' />
        compound expressions
      </p>
    </>
  );
}
