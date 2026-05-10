import { useTx } from '@/i18n';

import {
  IconCalculateAll,
  IconCalculateOne,
  IconDatabase,
  IconDestroy,
  IconDownload,
  IconReset,
  IconSave,
  IconText,
  IconTree,
  IconTypeGraph,
  IconUpload
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelValueEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.data')}</h1>
      <p>Here you can view and modify the value of a constituent</p>
      <p>
        To compute a value, click on the <LinkTopic text='status' topic={HelpTopic.UI_EVAL_STATUS} />
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconCalculateOne className='inline-icon icon-green' /> compute the current constituent:{' '}
          <kbd>{isMac() ? 'Cmd + Q' : 'Ctrl + Q'}</kbd>
        </li>
        <li>
          <IconDatabase className='inline-icon' /> dialog for viewing or editing the value
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> delete saved value
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> recompute the entire model: <kbd>Alt + Q</kbd>
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> display{' '}
          <LinkTopic text='typification step graph' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> display{' '}
          <LinkTopic text='parse tree' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <IconSave className='inline-icon' /> save value: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconReset className='inline-icon' /> discard changes
        </li>
        <li>
          <IconUpload className='inline-icon' /> import value from clipboard or file
        </li>
        <li>
          <IconDownload className='inline-icon' /> export value to clipboard or file
        </li>
        <li>
          <IconText className='inline-icon' /> display text or identifiers
        </li>
      </ul>
    </>
  );
}
