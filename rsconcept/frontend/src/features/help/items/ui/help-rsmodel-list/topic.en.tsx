import { useTx } from '@/i18n';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelListEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.list')}</h1>
      <p>The interface allows you to work with the list of model constituents.</p>
      <p>
        To edit definitions and terms, navigate to the{' '}
        <LinkTopic text='constituent editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
      </p>
      <p>
        To work with values, use the{' '}
        <LinkTopic text='model data tab' topic={HelpTopic.UI_MODEL_VALUE} />.
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconReset className='inline-icon' /> clear selection: <kbd>ESC</kbd>
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> recompute the entire model: <kbd>Alt + Q</kbd>
        </li>
        <li>
          <IconMoveUp className='inline-icon' />
          <IconMoveDown className='inline-icon' /> <kbd>Alt + Up/Down</kbd> move constituents
        </li>
        <li>
          <IconCrucial className='inline-icon' /> toggle the key constituent flag
        </li>
        <li>
          <IconOpenList className='inline-icon icon-green' /> quick add new constituent by type
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> create constituent via dialog
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> clone selected constituent
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> delete selected constituents
        </li>
      </ul>
    </>
  );
}
