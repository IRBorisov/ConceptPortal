import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import {
  IconAnimation,
  IconAnimationOff,
  IconChild,
  IconClone,
  IconConnect,
  IconConsolidation,
  IconCoordinates,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconFitImage,
  IconGrid,
  IconImage,
  IconLeftOpen,
  IconLineStraight,
  IconLineWave,
  IconNewItem,
  IconNewRSForm,
  IconReference,
  IconReset,
  IconRSForm,
  IconSave,
  IconSettings
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpOssGraphEn() {
  const tx = useTx();
  return (
    <>
      <h1 className='sm:pr-24'>{tx('tx.oss')}</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-64'>
          <h2>Graph settings</h2>
          <ul>
            <li>
              <IconReset className='inline-icon' /> Reset changes
            </li>
            <li>
              <IconFitImage className='inline-icon' /> Fit to screen
            </li>
            <li>
              <IconLeftOpen className='inline-icon' /> Contents panel
            </li>
            <li>
              <IconImage className='inline-icon' /> Save image
            </li>
            <li>
              <IconSettings className='inline-icon' /> Settings dialog
            </li>
            <li>
              <IconGrid className='inline-icon' /> Show grid
            </li>
            <li>
              <IconLineWave className='inline-icon' />
              <IconLineStraight className='inline-icon' /> Line type
            </li>
            <li>
              <IconAnimation className='inline-icon' />
              <IconAnimationOff className='inline-icon' /> Animation
            </li>
            <li>
              <IconCoordinates className='inline-icon' /> Show coordinates
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-76'>
          <h2>Node editing</h2>
          <ul>
            <li>
              <kbd>Click</kbd> on an operation — select
            </li>
            <li>
              <kbd>Esc</kbd> — clear selection
            </li>
            <li>
              <kbd>Double-click</kbd> — navigate to linked <LinkTopic text='CS' topic={HelpTopic.CC_SYSTEM} />
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> New node
            </li>
            <li>
              <IconEdit2 className='inline-icon' /> Edit node
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> <kbd>Delete</kbd> — delete selected
            </li>
          </ul>
        </div>
      </div>

      <Divider margins='my-2' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-64'>
          <h2>General</h2>
          <ul>
            <li>
              <IconSave className='inline-icon' /> Save node positions
            </li>
            <li>
              <IconRSForm className='inline-icon icon-green' /> Status of linked{' '}
              <LinkTopic text='CS' topic={HelpTopic.CC_SYSTEM} />
            </li>
            <li>
              <IconConsolidation className='inline-icon' />{' '}
              <LinkTopic text='Diamond synthesis' topic={HelpTopic.CC_OSS} />
            </li>
            <li>top bar — Load operation</li>
            <li>
              left bar — <LinkTopic text='external' topic={HelpTopic.CC_OSS} /> CS
            </li>
            <li>
              <kbd>Space</kbd> — pan the canvas
            </li>
            <li>
              <kbd>Shift</kbd> — extend selection
            </li>
            <li>
              <kbd>Arrows</kbd> — navigate selection
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-76'>
          <h2>Context menu</h2>
          <ul>
            <li>
              <IconNewRSForm className='inline-icon icon-green' /> Create empty CS for load
            </li>
            <li>
              <IconConnect className='inline-icon' /> Assign CS for load
            </li>
            <li>
              <IconChild className='inline-icon icon-green' />{' '}
              <LinkTopic text='Relocate constituents' topic={HelpTopic.UI_RELOCATE_CST} />
            </li>
            <li>
              <IconExecute className='inline-icon icon-green' /> Activate operation
            </li>
            <li>
              <IconReference className='inline-icon icon-green' /> Create replica
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> Clone CS and load
            </li>
            <li>
              <IconRSForm className='inline-icon' /> Open linked CS
            </li>
            <li>
              <IconReference className='inline-icon' /> Select replica original
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
