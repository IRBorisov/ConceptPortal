import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import {
  IconAlias,
  IconClone,
  IconDestroy,
  IconDownload,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconOSS,
  IconReset
} from '@/components/icons';

import { InfoCstStatus } from '../../../components/info-cst-status';
import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaListEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.list')}</h1>
      <ul>
        <li>
          <IconAlias className='inline-icon' />
          Constituents have a unique <LinkTopic text='Name' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>hovering over a name displays its attributes</li>
        <li>
          <LinkTopic text='inherited' topic={HelpTopic.CC_OSS} /> constituents are shown with a dashed border
        </li>
      </ul>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconOSS className='inline-icon' /> navigate to the associated{' '}
          <LinkTopic text='OSS' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <IconReset className='inline-icon' /> clear selection: <kbd>ESC</kbd>
        </li>
        <li>drag a row – reorder</li>
        <li>
          <kbd>Click</kbd> – select a row
        </li>
        <li>
          <kbd>Shift + click</kbd> – extend selection
        </li>
        <li>
          <kbd>Alt + click</kbd> – open Editor
        </li>
        <li>
          <kbd>Double click</kbd> – open Editor
        </li>
        <li>
          <IconMoveUp className='inline-icon' />
          <IconMoveDown className='inline-icon' /> <kbd>Alt + Up/Down</kbd> – move
        </li>

        <li>
          <IconClone className='inline-icon icon-green' /> clone selected: <kbd>Alt + V</kbd>
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> new constituent: <kbd>Alt + `</kbd>
        </li>
        <li>
          <IconOpenList className='inline-icon icon-green' /> quick add: <kbd>Alt + 1-6,W,E</kbd>
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> delete selected: <kbd>Delete</kbd>
        </li>
        <li>
          <IconDownload className='inline-icon' /> export table to file
        </li>
      </ul>

      <Divider margins='my-2' />

      <InfoCstStatus title='Statuses' />
    </>
  );
}
