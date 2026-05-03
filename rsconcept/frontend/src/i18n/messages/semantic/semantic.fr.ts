import { actionsFr } from './actions.fr';
import { termsFr } from './terms.fr';

export const semanticFr: Record<string, string> = {
  ...actionsFr,
  ...termsFr,

  'semantic.yes': 'Oui',
  'semantic.no': 'Non',
  'semantic.total': 'Total',
  'semantic.on': 'On',
  'semantic.off': 'Off'
};
