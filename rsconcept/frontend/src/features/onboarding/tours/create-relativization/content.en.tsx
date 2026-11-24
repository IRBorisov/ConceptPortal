import { type TourStepContent } from '../../models/tour';

export const createRelativizationContentEn: Record<string, TourStepContent> = {
  target: {
    title: 'Constituent for relativization',
    body: (
      <p>
        Open Editing → Relativization on a conceptual schema. Choose a base set or structure that defines the allowed
        contexts. If one such constituent was selected, the dialog preselects it.
      </p>
    )
  },
  parameters: {
    title: 'Exclusions',
    body: <p>Select kernel constituents that should have no direct context parameter. Exclusions are optional.</p>
  },
  result: {
    title: 'Title and new schema',
    body: (
      <p>
        The Portal suggests a title, which you can edit. Enter a short name and click Create. The result is a new
        standalone schema in the library.
      </p>
    )
  }
};
