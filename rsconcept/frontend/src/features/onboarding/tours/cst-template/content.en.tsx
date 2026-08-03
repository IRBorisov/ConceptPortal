import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const cstTemplateContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Create constituenta from template',
    body: (
      <p>
        This dialog instantiates an expression from the{' '}
        <TourHelpLink text='expression bank' topic={HelpTopic.RSL_TEMPLATES} />. Work left to right through the three
        tabs: <b>Template</b> → <b>Arguments</b> → <b>Editor</b>. On <b>Template</b>, filter the list with{' '}
        <b>Source</b> and <b>Category</b>, then pick a template.
      </p>
    )
  },
  workflow: {
    title: 'Arguments',
    body: (
      <>
        <p>
          On <b>Arguments</b>, bind each parameter to a constituent from the current schema; values are substituted into
          the expression (including nested auxiliary functions from the bank). Below you see the{' '}
          <b>Resulting definition</b>.
        </p>
        <p>When every argument is filled, the type of the main constituent updates automatically.</p>
      </>
    )
  },
  create: {
    title: 'Edit and create',
    body: (
      <>
        <p>
          On <b>Editor</b>, adjust <b>Name</b>, <b>Term</b>, <b>formal</b> and <b>textual definition</b> for the main
          item. Click <b>Create</b>: the schema receives every required auxiliary function from the bank that is not
          already present, then the main constituent — auxiliaries first so references stay valid.
        </p>
        <p>Existing schema names are not duplicated; bank names are rewritten to new names in the target schema.</p>
      </>
    )
  }
};
