import { useTx } from '@/i18n';

import { IconDestroy, IconEditor, IconFolderEdit, IconOSS, IconOwner, IconSave, IconShare } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaCardEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.passport')}</h1>

      <p>The passport contains information about the conceptual schema and its statistics.</p>
      <p>
        It allows you to manage attributes and <LinkTopic text='versions' topic={HelpTopic.VERSIONS} />.
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconOSS className='inline-icon' /> associated <LinkTopic text='OSS' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <IconSave className='inline-icon' /> save: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> copy link
        </li>
        <li>
          <IconEditor className='inline-icon' /> editor — editing rights
        </li>
        <li>
          <IconOwner className='inline-icon' /> owner — full access
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> delete schema
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> change location
        </li>
      </ul>
    </>
  );
}
