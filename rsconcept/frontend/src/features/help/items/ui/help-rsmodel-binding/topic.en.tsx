import { useTx } from '@/i18n';

import { IconNewItem, IconRemove, IconSearch } from '@/components/icons';

export function HelpRSModelBindingEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.binding')}</h1>
      <p>This dialog defines a value table for elements of an undefined concept (basis set) in the model.</p>

      <ul>
        <li>select a row to edit the element's value</li>
        <li>
          <IconSearch className='inline-icon' /> search by element value text
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> add a new row to the model
        </li>
        <li>
          <IconRemove className='inline-icon icon-red' /> delete a row from the model
        </li>
      </ul>
    </>
  );
}
