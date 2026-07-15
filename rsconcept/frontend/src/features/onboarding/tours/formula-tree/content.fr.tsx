import { HelpTopic } from '@/features/help';

import { IconNewItem } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const formulaTreeContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Arbre syntaxique',
    body: (
      <p>
        L&apos;
        <TourHelpLink text='arbre syntaxique' topic={HelpTopic.UI_FORMULA_TREE} /> montre la structure de
        l&apos;expression. Survolez un nœud pour surligner le fragment dans la bannière et voir sa typification.
      </p>
    )
  },
  canvas: {
    title: 'Naviguer dans l’arbre',
    body: (
      <p>
        Cliquez sur un nœud pour sélectionner une sous-expression. Maintenez <kbd>Space</kbd> pour panoramiquer sans
        survoler les nœuds ; zoomez avec la molette. Les couleurs indiquent le rôle linguistique (déclarations, globaux,
        logique, expressions typées, etc.).
      </p>
    )
  },
  extract: {
    title: 'Extraire une constituante',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Quand l&apos;extraction est disponible, sélectionnez un nœud imbriqué (pas la racine), puis appuyez sur{' '}
          <kbd>Q</kbd> ou cliquez <IconNewItem className='inline-icon' /> Extraire pour en faire une nouvelle
          constituante.
        </p>
        <p>
          Dans le panneau d&apos;extraction, saisissez le terme (et éventuellement la définition textuelle), puis
          confirmez avec <kbd>{saveHotkey}</kbd>. <kbd>Esc</kbd> ferme le panneau sans extraire.
        </p>
      </div>
    )
  }
};
