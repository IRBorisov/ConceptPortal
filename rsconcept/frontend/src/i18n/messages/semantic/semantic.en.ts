import { actionsEn } from './actions.en';
import { termsEn } from './terms.en';

export const semanticEn: Record<string, string> = {
  ...actionsEn,
  ...termsEn,

  'semantic.yes': 'Yes',
  'semantic.no': 'No',
  'semantic.on': 'On',
  'semantic.off': 'Off',
  'semantic.true': 'True',
  'semantic.false': 'False',

  'semantic.total': 'Total',
  'semantic.example': 'Example',

  'semantic.listIsEmpty': 'List is empty'
};
