import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const sandboxIntroContentEn: Record<string, TourStepContent> = {
  welcome: {
    title: 'Welcome to the Sandbox',
    body: (
      <>
        <p>
          The Sandbox is a demo environment that works without registration. It contains a small conceptual schema and a
          model, stored locally in your browser.
        </p>
        <p>
          This is a short overview of the editor tabs. On a step with Details, you can open a guide for the highlighted
          tab.
        </p>
      </>
    )
  },
  passport: {
    title: 'Passport',
    body: (
      <p>
        The <TourHelpLink text='passport' topic={HelpTopic.UI_SCHEMA_CARD} /> sets the title, alias, and description of
        this demo schema and model. Details covers the form and the statistics side panel.
      </p>
    )
  },
  list: {
    title: 'Constituents list',
    body: (
      <p>
        The <TourHelpLink text='list' topic={HelpTopic.UI_MODEL_LIST} /> shows schema constituents in one table:
        undefined concepts, terms, functions, axioms, statements, and more. When a model is open, evaluation status is
        shown too.
      </p>
    )
  },
  concept: {
    title: 'Concept',
    body: (
      <p>
        On the <TourHelpLink text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> tab you edit one constituent: its term,
        convention or textual definition, and formal definition.
      </p>
    )
  },
  graph: {
    title: 'Graph',
    body: (
      <p>
        The <TourHelpLink text='Graph' topic={HelpTopic.UI_GRAPH_TERM} /> tab shows links between constituents by
        definition and attribution.
      </p>
    )
  },
  data: {
    title: 'Data',
    body: (
      <p>
        On the <TourHelpLink text='Data' topic={HelpTopic.UI_MODEL_VALUE} /> tab you set and inspect constituent values:
        undefined concepts get an interpretation from the subject domain; derived ones show computed results.
      </p>
    )
  },
  evaluation: {
    title: 'Evaluation',
    body: (
      <p>
        The <TourHelpLink text='Evaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> tab checks arbitrary RSLang
        expressions against model data without changing constituents.
      </p>
    )
  },
  finish: {
    title: 'Ready to work',
    body: (
      <>
        <p>
          The core loop: manage and edit constituents, provide data, and evaluate expressions. Restore starting data with
          Reset all in the menu (☰).
        </p>
        <p>
          Reopen this tutorial with Show tutorial in the same menu; a tab guide is Quick guide in that tab&apos;s tour
          badge menu. See also the <TourHelpLink text='manuals' topic={HelpTopic.INTERFACE} />.
        </p>
      </>
    )
  }
};
