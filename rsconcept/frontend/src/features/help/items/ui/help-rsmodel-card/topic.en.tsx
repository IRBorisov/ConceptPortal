import { useTx } from '@/i18n';

import {
  IconDestroy,
  IconEditor,
  IconFolderEdit,
  IconOwner,
  IconRSForm,
  IconSave,
  IconShare
} from '@/components/icons';
import { isMac } from '@/utils/utils';

export function HelpRSModelCardEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.passport')}</h1>
      <p>Contains core information and statistics about the model.</p>
      <p>The name and attributes of the source conceptual schema are not editable here.</p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconSave className='inline-icon' /> save: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> copy link
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> delete from the Portal database
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> change location
        </li>
        <li>
          <IconEditor className='inline-icon' /> model editors
        </li>
        <li>
          <IconOwner className='inline-icon' /> change owner
        </li>
        <li>
          <IconRSForm className='inline-icon' /> navigate to the conceptual schema
        </li>
      </ul>
    </>
  );
}
