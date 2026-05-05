import { actionsFr } from './actions.fr';
import { termsFr } from './terms.fr';

export const semanticFr: Record<string, string> = {
  ...actionsFr,
  ...termsFr,

  'semantic.yes': 'Oui',
  'semantic.no': 'Non',
  'semantic.on': 'On',
  'semantic.off': 'Off',
  'semantic.true': 'Vrai',
  'semantic.false': 'Faux',

  'semantic.total': 'Total',
  'semantic.example': 'Exemple',

  'semantic.listIsEmpty': 'Liste vide'
};
