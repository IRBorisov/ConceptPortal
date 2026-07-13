import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconSearch
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const constituentsListContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Constituents list',
    body: (
      <p>
        Constituents are the building blocks of a schema: base sets, terms, definitions, and axioms. The{' '}
        <TourHelpLink text='list' topic={HelpTopic.UI_MODEL_LIST} /> tab shows them all in one table — with evaluation
        status when a model is attached.
      </p>
    )
  },
  filter: {
    title: 'Search',
    body: (
      <p>
        Use the <IconSearch className='inline-icon' /> search field to find constituents by alias, term, or definition
        text. See the <TourHelpLink text='constituent list' topic={HelpTopic.UI_SCHEMA_LIST} /> manual for details.
      </p>
    )
  },
  selection: {
    title: 'Selection counter',
    body: (
      <p>
        The counter on the left shows how many constituents are selected out of the total. Click rows to select; use{' '}
        <kbd>Esc</kbd> to clear the selection.
      </p>
    )
  },
  toolbar: {
    title: 'List toolbar',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconNewItem className='inline-icon icon-green' /> create, <IconClone className='inline-icon icon-green' />{' '}
          clone, and <IconDestroy className='inline-icon icon-red' /> delete selected items.{' '}
          <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> reorder;{' '}
          <IconCrucial className='inline-icon' /> marks crucial constituents.
        </p>
        <p>
          On a model, <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalculates all
          values.
        </p>
      </div>
    )
  },
  interact: {
    title: 'Table interactions',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <kbd>Shift</kbd>-click extends the selection. Double-click a row or press <kbd>Alt</kbd> while clicking to
          open a constituent in the <TourHelpLink text='editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Drag rows to change their order in the schema. Reordering is disabled while search is active — clear the
          search field first if you need to move items.
        </p>
      </div>
    )
  }
};
