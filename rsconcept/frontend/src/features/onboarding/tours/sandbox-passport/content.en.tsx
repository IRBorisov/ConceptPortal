import { IconSave } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

export const sandboxPassportContentEn: Record<string, TourStepContent> = {
  overview: {
    title: 'Sandbox passport',
    body: (
      <p>
        The passport sets the title, alias, and description of the local demo schema and model. Data stays in the
        browser — no library access or ownership.
      </p>
    )
  },
  form: {
    title: 'Title, alias, description',
    body: (
      <p>
        Edit the demo title, alias, and description. Changes are stored locally; <IconSave className='inline-icon' />{' '}
        applies them to the Sandbox bundle.
      </p>
    )
  },
  stats: {
    title: 'Statistics side panel',
    body: (
      <>
        <p>
          The side panel shows schema constituent counts and model issues — for example undefined concepts without
          interpretation or evaluation errors.
        </p>
        <p>Expand categories for a breakdown by type.</p>
      </>
    )
  }
};
