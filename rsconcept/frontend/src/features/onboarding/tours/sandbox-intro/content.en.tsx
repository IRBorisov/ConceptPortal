import { HelpTopic } from '@/features/help';

import {
  IconGenerateStructure,
  IconSearch,
  IconStatusOK,
  IconStatusUnknown,
  IconTree,
  IconTypeGraph
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

import { TourHelpLink } from './tour-help-links';

export const sandboxIntroContentEn: Record<string, TourStepContent> = {
  'welcome': {
    title: 'Welcome to the Sandbox',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The Sandbox is a demo environment that works without registration. It contains a small conceptual schema
          together with a model, stored locally in your browser.
        </p>
        <p>
          This tour walks through the editor: managing constituents, editing and checking formal definitions with error
          diagnostics, and inspecting model data and evaluation results.
        </p>
      </div>
    )
  },
  'passport': {
    title: 'Passport',
    body: (
      <p>
        The <TourHelpLink text='passport' topic={HelpTopic.UI_SCHEMA_CARD} /> names your schema and model: title, alias,
        and description. Every item in the Portal library has one. Next we will look at the constituents themselves.
      </p>
    )
  },
  'list': {
    title: 'Constituents list',
    body: (
      <p>
        Constituents are the building blocks of a schema: base sets, terms, definitions, and axioms. The{' '}
        <TourHelpLink text='list' topic={HelpTopic.UI_MODEL_LIST} /> tab shows them all in one table — with evaluation
        status when a model is attached.
      </p>
    )
  },
  'list-filter': {
    title: 'Search',
    body: (
      <p>
        Use the <IconSearch className='inline-icon' /> search field to find constituents by alias, term, or definition
        text. See the <TourHelpLink text='constituent list' topic={HelpTopic.UI_SCHEMA_LIST} /> manual for details.
      </p>
    )
  },
  'list-interact': {
    title: 'Select and reorder',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Click rows to select constituents; the counter on the left shows how many are selected. Double-click a row or
          press <kbd>Alt</kbd> while clicking to open a constituent in the{' '}
          <TourHelpLink text='editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Drag rows to change their order in the schema. Reordering is disabled while search is active — clear the
          search field first if you need to move items.
        </p>
      </div>
    )
  },
  'concept': {
    title: 'Concept editor',
    body: (
      <p>
        Here a single constituent is edited in the{' '}
        <TourHelpLink text='concept editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />: its term, textual definition, and
        formal definition. Select constituents in the list to open them on this tab. In the Sandbox you can experiment
        freely — data stays local.
      </p>
    )
  },
  'concept-check': {
    title: 'Check and diagnostics',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          After editing a formal definition, the <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='definition status' topic={HelpTopic.UI_CST_STATUS} /> indicator turns blue until you run a
          check. Click it or press <kbd>Ctrl + Q</kbd> to validate the expression.
        </p>
        <p>
          If something is wrong, errors appear below the editor — click an error to jump to the problematic fragment in
          the expression. A <IconStatusOK className='inline-icon' /> green status means the definition is verified.
        </p>
      </div>
    )
  },
  'concept-tools': {
    title: 'Syntax tree and type graph',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The <IconTree className='inline-icon' /> <TourHelpLink text='syntax tree' topic={HelpTopic.UI_FORMULA_TREE} />{' '}
          button opens a dialog with the parse tree of the formal definition — useful for understanding structure and
          spotting parse issues.
        </p>
        <p>
          The <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='type graph' topic={HelpTopic.UI_TYPE_GRAPH} /> button shows how types in the expression
          relate as an echelon graph — a visual map of typification steps.
        </p>
      </div>
    )
  },
  'concept-structure': {
    title: 'Structure planner',
    body: (
      <p>
        For structured concepts, <IconGenerateStructure size='1.25rem' className='inline-icon' /> Expand structure opens
        the <TourHelpLink text='structure planner' topic={HelpTopic.UI_STRUCTURE_PLANNER} />: an interactive graph for
        decomposing a concept into derived constituents. You can add, edit, and link items directly from the diagram.
      </p>
    )
  },
  'graph': {
    title: 'Term graph',
    body: (
      <p>
        The <TourHelpLink text='term graph' topic={HelpTopic.UI_GRAPH_TERM} /> visualizes relationships between
        concepts: which definitions depend on which. It helps to see the structure of the schema as a whole.
      </p>
    )
  },
  'data': {
    title: 'Model data',
    body: (
      <p>
        On the <TourHelpLink text='model data' topic={HelpTopic.UI_MODEL_VALUE} /> tab, the schema meets the model: base
        sets receive concrete elements. The schema defines the structure, and the model fills it with values from a
        subject domain.
      </p>
    )
  },
  'evaluation': {
    title: 'Evaluation',
    body: (
      <p>
        On the <TourHelpLink text='evaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> tab, definitions are computed
        over the model data. Here you can inspect calculated values and issues — for example, expressions that cannot be
        evaluated with the current data.
      </p>
    )
  },
  'finish': {
    title: 'You are all set',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          That is the core loop: manage constituents, edit and check definitions, provide model data, and inspect
          evaluation results.
        </p>
        <p>
          Explore the Sandbox freely — you can always restore the initial data from the menu, or read the{' '}
          <TourHelpLink text='manuals' topic={HelpTopic.INTERFACE} />.
        </p>
      </div>
    )
  }
};
