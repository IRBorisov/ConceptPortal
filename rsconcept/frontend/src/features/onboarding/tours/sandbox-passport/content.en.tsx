import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

export const sandboxPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Passport',
    body: (
      <p>
        The Passport tab sets the title, alias, and description of the local demo schema and model. Data stays in the
        browser — without library access policies or ownership.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Edit the title, alias, and description. Changes reach the Sandbox data in the browser only after you save —{' '}
        <IconSave className='inline-icon' /> &quot;Save&quot; or <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <>
        <p>
          The side panel is split into Contents, Schema, Correctness, and Model. Under Model — interpretation issues:
          undefined concepts without interpretation, violated axioms, invalid data, and evaluation errors.
        </p>
        <p>Expand categories for a breakdown by type.</p>
      </>
    )
  }
};
