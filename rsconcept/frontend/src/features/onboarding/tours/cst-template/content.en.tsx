import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const cstTemplateContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Create from template',
    body: (
      <p>
        This dialog instantiates an expression from the{' '}
        <TourHelpLink text='template bank' topic={HelpTopic.RSL_TEMPLATES} />. Work left to right through the three
        tabs: Template → Arguments → Constituent.
      </p>
    )
  },
  workflow: {
    title: 'Template and arguments',
    body: (
      <>
        <p>
          On <b>Template</b>, pick a parameterized concept or assertion. On <b>Arguments</b>, bind each parameter to a
          constituent from the current schema; values are substituted into the expression (including nested bank
          helpers).
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
          On <b>Constituent</b>, adjust alias, term, and definitions for the main item. Create adds every required bank
          helper that is not already in the schema, then the main constituent — helpers first so references stay valid.
        </p>
        <p>Existing schema names are not duplicated; bank aliases are rewritten to new names in the target schema.</p>
      </>
    )
  }
};
