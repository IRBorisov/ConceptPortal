import { HelpTopic } from '@/features/help';

import {
  IconCalculateAll,
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset,
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
        more. The List tab shows them in a table; when a model is open — a Value column too. Manuals:{' '}
        <TourHelpLink text='schema list' topic={HelpTopic.UI_SCHEMA_LIST} />,{' '}
        <TourHelpLink text='model list' topic={HelpTopic.UI_MODEL_LIST} />.
      </p>
    )
  },
  filter: {
    title: 'Search',
    body: (
      <>
        <p>
          Try it: type in the <IconSearch className='inline-icon' /> search field. The list filters by name, term, formal
          and textual definition, convention or comment. Press Enter or click outside the field — the guide continues.
        </p>
        <p>
          See the <TourHelpLink text='schema list' topic={HelpTopic.UI_SCHEMA_LIST} /> and{' '}
          <TourHelpLink text='model list' topic={HelpTopic.UI_MODEL_LIST} /> manuals for details.
        </p>
      </>
    )
  },
  selection: {
    title: 'Selection … of …',
    body: (
      <p>
        On the left you see how many constituents are selected out of the total. Click a row to select; <kbd>Esc</kbd>{' '}
        or <IconReset className='inline-icon' /> on the toolbar clears the selection. The counter and toolbar appear only
        in edit mode.
      </p>
    )
  },
  toolbar: {
    title: 'List toolbar',
    body: (
      <>
        <p>
          <IconReset className='inline-icon' /> clears the selection (<kbd>Esc</kbd>). In a model,{' '}
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) next recalculates all values.{' '}
          <IconMoveUp className='inline-icon' /> / <IconMoveDown className='inline-icon' /> reorder;{' '}
          <IconCrucial className='inline-icon' /> marks crucial constituents.
        </p>
        <p>
          <IconOpenList className='inline-icon icon-green' /> creates by type,{' '}
          <IconNewItem className='inline-icon icon-green' /> via dialog;{' '}
          <IconClone className='inline-icon icon-green' /> clones and{' '}
          <IconDestroy className='inline-icon icon-red' /> deletes selected items. The toolbar is shown only while
          editing.
        </p>
      </>
    )
  },
  interact: {
    title: 'Table interactions',
    body: (
      <>
        <p>
          <kbd>Shift</kbd>-click extends the selection. Double-click a row or <kbd>Alt</kbd>-click to open a
          constituent: in a schema — the <TourHelpLink text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> tab; in a
          model — the <TourHelpLink text='Data' topic={HelpTopic.UI_MODEL_VALUE} /> tab.
        </p>
        <p>
          Drag rows to change their order. While search is active, reordering (and the toolbar arrows) is disabled —
          clear the search field first.
        </p>
      </>
    )
  }
};
