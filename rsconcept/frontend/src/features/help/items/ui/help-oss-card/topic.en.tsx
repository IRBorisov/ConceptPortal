import { useTx } from '@/i18n';

import { IconDestroy, IconEditor, IconFolderEdit, IconOwner, IconSave, IconShare } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpOssCardEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.passport')}</h1>

      <p>
        The passport contains information about the operational synthesis schema in the library and summary statistics on
        operations.
      </p>
      <p>
        The form fields, the "Access" block, and the location work analogously to the&nbsp;
        <LinkTopic text='conceptual schema passport' topic={HelpTopic.UI_SCHEMA_CARD} />.
      </p>
      <p>
        The composition of operations and the relation graph are edited&nbsp;
        <LinkTopic text='in the OSS graph view' topic={HelpTopic.UI_OSS_GRAPH} /> and&nbsp;
        <LinkTopic text='in the sidebar' topic={HelpTopic.UI_OSS_SIDEBAR} />.
      </p>

      <h2>OSS specifics</h2>
      <ul>
        <li>
          The statistics side area (panel expand button) shows the number of operations by type (blocks, load, synthesis,
          replica) and a summary of linked conceptual schemas (total, own, imported).
        </li>
        <li>
          The theoretical foundations of synthesis are outlined in&nbsp;
          <LinkTopic text='Operational Synthesis Schema' topic={HelpTopic.CC_OSS} />.
        </li>
      </ul>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconSave className='inline-icon' /> save: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> copy link to OSS
        </li>
        <li>
          <IconEditor className='inline-icon' /> editor — editing rights
        </li>
        <li>
          <IconOwner className='inline-icon' /> owner — full access
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> delete from the Portal database
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> edit location
        </li>
      </ul>
    </>
  );
}
