import { actionsRu } from './actions.ru';
import { termsRu } from './terms.ru';

export const semanticRu: Record<string, string> = {
  ...actionsRu,
  ...termsRu,

  'semantic.yes': 'Да',
  'semantic.no': 'Нет',
  'semantic.total': 'Всего',
  'semantic.on': 'Вкл',
  'semantic.off': 'Выкл'
};
