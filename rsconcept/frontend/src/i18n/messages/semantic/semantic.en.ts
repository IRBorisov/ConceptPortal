import { actionsEn } from './actions.en';
import { termsEn } from './terms.en';

export const semanticEn: Record<string, string> = {
  ...actionsEn,
  ...termsEn,

  'semantic.yes': 'Yes',
  'semantic.no': 'No',
  'semantic.total': 'Total',
  'semantic.on': 'On',
  'semantic.off': 'Off'
};
