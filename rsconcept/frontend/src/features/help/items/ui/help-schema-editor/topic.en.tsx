import { useTx } from '@/i18n';

import {
  IconChild,
  IconClone,
  IconCrucial,
  IconDatabase,
  IconDestroy,
  IconFilterReset,
  IconGraphCore,
  IconKeyboard,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOSS,
  IconPredecessor,
  IconReset,
  IconSave,
  IconSearch,
  IconStatusError,
  IconStatusOK,
  IconTree,
  IconTypeGraph
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaEditorEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.cst.edit.ui')}</h1>

      <div className='flex flex-col sm:flex-row sm:gap-3'>
        <div>
          <h2>{tx('tx.general.controls')}</h2>
          <ul>
            <li>
              <IconCrucial className='inline-icon' /> key status
            </li>
            <li>
              <LinkTopic text='interpretability' topic={HelpTopic.RSL_INTERPRET} />
              <IconDatabase className='inline-icon' /> value class
            </li>
            <li>
              <IconOSS className='inline-icon' /> navigate to <LinkTopic text='OSS' topic={HelpTopic.CC_OSS} />
            </li>
            <li>
              <IconPredecessor className='inline-icon' /> navigate to source
            </li>
            <li>
              <IconSave className='inline-icon' /> save: <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
            </li>
            <li>
              <IconReset className='inline-icon' /> discard changes
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> clone: <kbd>Alt + V</kbd>
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> new constituent
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> delete
            </li>
          </ul>
        </div>

        <div>
          <h2>Constituent list</h2>
          <ul>
            <li>
              <IconMoveDown className='inline-icon' />
              <IconMoveUp className='inline-icon' /> <kbd>Alt + Up/Down</kbd>
            </li>
            <li>
              <IconFilterReset className='inline-icon' /> clear filter
            </li>
            <li>
              <IconSearch className='inline-icon' /> filter by attributes
            </li>
            <li>
              <IconStatusError className='inline-icon' /> problematic concepts
            </li>
            <li>
              <IconGraphCore className='inline-icon' /> primitive concepts
            </li>
            <li>
              <IconCrucial className='inline-icon' /> key constituents
            </li>
            <li>
              <IconChild className='inline-icon' /> inherited
            </li>
            <li>
              <span className='cc-sample-color bg-selected' />
              selected constituent
            </li>
            <li>
              <span className='cc-sample-color bg-accent-green50' />
              <LinkTopic text='basis' topic={HelpTopic.CC_RELATIONS} /> of selected
            </li>
            <li>
              <span className='cc-sample-color bg-accent-orange50' />
              <LinkTopic text='generated' topic={HelpTopic.CC_RELATIONS} /> from selected
            </li>
          </ul>
        </div>
      </div>

      <h2>Formal definition</h2>
      <ul>
        <li>
          <IconStatusOK className='inline-icon' /> definition status indicator at the top
        </li>
        <li>
          <IconKeyboard className='inline-icon' /> special keyboard and shortcuts
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> display{' '}
          <LinkTopic text='typification step graph' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> display <LinkTopic text='parse tree' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + Space' : 'Ctrl + Space'}</kbd> insert unused name / replace projection
        </li>
      </ul>

      <h2>Term and textual definition</h2>
      <ul>
        <li>
          Edit <LinkTopic text='Name' topic={HelpTopic.CC_CONSTITUENTA} /> /{' '}
          <LinkTopic text='Term' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <kbd>Alt + 1</kbd> edit references
        </li>
        <li>
          <kbd>Alt + 2</kbd> edit related words
        </li>
      </ul>
    </>
  );
}
