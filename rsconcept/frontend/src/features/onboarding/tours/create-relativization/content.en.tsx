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
        Under “Relativization target”, choose a base set or generic structure to define what counts as one context. Open
        “Excluded constituents” to select any undefined concepts that should remain shared across contexts.
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
