import { useTx } from '@/i18n';

import { IconMoveDown, IconMoveUp, IconOSS, IconPredecessor } from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRelocateCstEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relocate')}</h1>
      <p>
        Constituent relocation is an operation in which selected constituents are moved from the current CS (source) to
        another CS (target) within the same <IconOSS size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='operational synthesis schema' topic={HelpTopic.CC_OSS} />.
      </p>
      <ul>
        <li>
          only applicable to <IconPredecessor size='1rem' className='inline-icon' /> own constituents of the source
        </li>
        <li>
          <IconMoveUp size='1rem' className='inline-icon' />
          <IconMoveDown size='1rem' className='inline-icon' /> direction of relocation — up or down the synthesis tree
        </li>
      </ul>

      <h2>Relocate up</h2>
      <ul>
        <li>selected constituents become inherited; their copies are added to the target CS</li>
        <li>constituents that depend on constituents from other conceptual schemas cannot be selected</li>
      </ul>

      <h2>Relocate down</h2>
      <ul>
        <li>
          selected constituents become own constituents of the target CS; they are removed from the source CS and its
          successors
        </li>
      </ul>
    </>
  );
}
