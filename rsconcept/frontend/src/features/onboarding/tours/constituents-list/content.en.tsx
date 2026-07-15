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
        Constituents are parts of a conceptual schema: undefined concepts, terms, functions, axioms, statements, and
        more. The <TourHelpLink text='list' topic={HelpTopic.UI_MODEL_LIST} /> tab shows them in a table; when a model
        is open — evaluation status too.
      </p>
    )
  },
  filter: {
    title: 'Search',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Try it: type in the <IconSearch className='inline-icon' /> search field. The list filters by alias, term,
          definitions, and convention. Press Enter or leave the field — the guide continues.
        </p>
        <p>
          See the <TourHelpLink text='constituent list' topic={HelpTopic.UI_SCHEMA_LIST} /> manual for details.
        </p>
      </div>
    )
  },
  selection: {
    title: 'Selection counter',
    body: (
      <p>
        The counter on the left shows how many constituents are selected out of the total. Click a row to select;{' '}
        <kbd>Esc</kbd> clears the selection.
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
          When a model is open, <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>)
          recalculates all values.
        </p>
      </div>
    )
  },
  interact: {
    title: 'Table interactions',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <kbd>Shift</kbd>-click extends the selection. Double-click a row or <kbd>Alt</kbd>-click to open a constituent
          in the <TourHelpLink text='editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Drag rows to change their order. Reordering is disabled while search is active — clear the search field first.
        </p>
      </div>
    )
  }
};
