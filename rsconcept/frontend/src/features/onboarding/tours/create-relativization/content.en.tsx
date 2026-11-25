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
    title: 'Constituent for relativization and exclusions',
    body: (
      <p>
        In “Constituent for relativization”, choose a base set or structure that defines the allowed contexts. Select
        any kernel constituents that should have no direct context parameter. Exclusions are optional.
      </p>
    )
  },
  result: {
    title: 'Title and result',
    body: (
      <p>
        Review the title and enter an alias. Choose “Review texts”, open each kernel proposal, add the necessary
        clarifications, and choose “Confirm texts and create CS”. The result appears on the OSS graph.
      </p>
    )
  }
};
