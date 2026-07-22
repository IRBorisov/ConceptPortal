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
        shown too. Details covers search, selection, and order.
      </p>
    )
  },
  concept: {
    title: 'Concept editor',
    body: (
      <p>
        Here you edit one constituent in the <TourHelpLink text='concept editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />:
        its term, convention or textual definition, and formal definition. Details covers checking, syntax tools, and
        structure expansion.
      </p>
    )
  },
  graph: {
    title: 'Term graph',
    body: (
      <p>
        The <TourHelpLink text='term graph' topic={HelpTopic.UI_GRAPH_TERM} /> shows constituent links by definition and
        attribution. Details covers view options, modes, and canvas navigation.
      </p>
    )
  },
  data: {
    title: 'Model data',
    body: (
      <p>
        On the <TourHelpLink text='model data' topic={HelpTopic.UI_MODEL_VALUE} /> tab you set and inspect constituent
        values: undefined concepts get an interpretation from the subject domain; derived ones show computed results.
        Details covers compute, save, and binding.
      </p>
    )
  },
  evaluation: {
    title: 'Evaluation',
    body: (
      <p>
        The <TourHelpLink text='Evaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> tab checks arbitrary RSLang
        expressions against model data without changing constituents. Details covers the expression field and result
        viewer.
      </p>
    )
  },
  finish: {
    title: 'You are all set',
    body: (
      <>
        <p>
          The core loop: manage and edit constituents, provide model data, and evaluate expressions. You can restore the
          initial data from the Sandbox menu.
        </p>
        <p>
          Reopen this overview from the Sandbox menu; start a tab guide from that tab&apos;s help badge menu (Quick
          guide). See also the <TourHelpLink text='manuals' topic={HelpTopic.INTERFACE} />.
        </p>
      </>
    )
  }
};
