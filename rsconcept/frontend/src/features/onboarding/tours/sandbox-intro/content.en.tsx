import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const sandboxIntroContentEn: Record<string, TourStepContent> = {
  welcome: {
    title: 'Welcome to the Sandbox',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The Sandbox is a demo environment that works without registration. It contains a small conceptual schema
          together with a model, stored locally in your browser.
        </p>
        <p>
          This short tour introduces the editor tabs. On some steps you can open a deeper walkthrough of that tab, or
          start those tours later from the menu while you are on the tab.
        </p>
      </div>
    )
  },
  passport: {
    title: 'Passport',
    body: (
      <p>
        The <TourHelpLink text='passport' topic={HelpTopic.UI_SCHEMA_CARD} /> names your schema and model: title, alias,
        and description. Use Details for the form and the statistics side panel.
      </p>
    )
  },
  list: {
    title: 'Constituents list',
    body: (
      <p>
        Constituents are the building blocks of a schema: base sets, terms, definitions, and axioms. The{' '}
        <TourHelpLink text='list' topic={HelpTopic.UI_MODEL_LIST} /> tab shows them all in one table — with evaluation
        status when a model is attached. Use Details for search, selection, and reordering.
      </p>
    )
  },
  concept: {
    title: 'Concept editor',
    body: (
      <p>
        Here a single constituent is edited in the{' '}
        <TourHelpLink text='concept editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />: its term, textual definition, and
        formal definition. Use Details for checking definitions, syntax tools, and the structure planner.
      </p>
    )
  },
  graph: {
    title: 'Term graph',
    body: (
      <p>
        The <TourHelpLink text='term graph' topic={HelpTopic.UI_GRAPH_TERM} /> visualizes relationships between
        concepts: which definitions depend on which. Use Details for view options, modes, and canvas navigation.
      </p>
    )
  },
  data: {
    title: 'Model data',
    body: (
      <p>
        On the <TourHelpLink text='model data' topic={HelpTopic.UI_MODEL_VALUE} /> tab, the schema meets the model: base
        sets receive concrete elements. The schema defines the structure, and the model fills it with values from a
        subject domain. Use Details for compute, save, and binding.
      </p>
    )
  },
  evaluation: {
    title: 'Evaluation',
    body: (
      <p>
        On the <TourHelpLink text='evaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> tab, definitions are computed
        over the model data. Here you can inspect calculated values and issues — for example, expressions that cannot be
        evaluated with the current data. Use Details for ad-hoc expressions and the result viewer.
      </p>
    )
  },
  finish: {
    title: 'You are all set',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          That is the core loop: manage constituents, edit and check definitions, provide model data, and inspect
          evaluation results.
        </p>
        <p>
          Explore the Sandbox freely — you can always restore the initial data from the menu, reopen this overview, or
          start a tab tour from the menu while on that tab. See also the{' '}
          <TourHelpLink text='manuals' topic={HelpTopic.INTERFACE} />.
        </p>
      </div>
    )
  }
};
