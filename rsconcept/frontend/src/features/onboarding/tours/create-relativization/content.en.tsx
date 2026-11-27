import { type TourStepContent } from '../../models/tour';

export const createRelativizationContentEn: Record<string, TourStepContent> = {
  source: {
    title: 'Source schema',
    body: (
      <p>
        Open Add… → Relativization in the OSS graph. The operation takes one attached conceptual schema. If one node
        with an attached schema was selected, the dialog preselects it.
      </p>
    )
  },
  parameters: {
    title: 'Relativization target and exclusions',
    body: (
      <p>
        Choose a base set or generic structure and enter a family name. Under “Excluded constituents”, mark the
        undefined concepts shared across contexts.
      </p>
    )
  },
  result: {
    title: 'Title and result',
    body: <p>Check the title and enter an alias. Select “Create”. Check the texts in the resulting schema.</p>
  }
};
