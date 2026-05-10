import { useTx } from '@/i18n';

import { IconNewItem, IconRemove, IconReset, IconText } from '@/components/icons';

export function HelpRSModelValueEditEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.value.editor')}</h1>
      <p>This dialog opens an individual value in a structured view</p>
      <p>Only elements of one structure are displayed at a time; nested subsets expand on click</p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>headers and labels help navigate nested value components</li>
        <li>click on a value to edit it</li>
        <li>
          <span className='text-accent-red-foreground'>red</span> highlights invalid identifiers and sets
        </li>
        <li>
          <span className='text-accent-green-foreground'>green</span> highlights filtered results
        </li>
        <li>
          <IconReset className='inline-icon' /> show the original set
        </li>
        <li>
          <IconText className='inline-icon' /> display text or identifiers
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> add a new element to the current set
        </li>
        <li>
          <IconRemove className='inline-icon icon-red' /> remove an element from the current set
        </li>
      </ul>
    </>
  );
}
