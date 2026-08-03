import { HelpTopic } from '@/features/help';

import { IconNewItem } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const formulaTreeContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Arbre de syntaxe',
    body: (
      <p>
        L&apos;
        <TourHelpLink text='arbre de syntaxe' topic={HelpTopic.UI_FORMULA_TREE} /> montre la structure de
        l&apos;expression. Survolez un nœud pour surligner le fragment dans la bannière ; la typification apparaît dans
        l&apos;infobulle du nœud.
      </p>
    )
  },
  canvas: {
    title: 'Naviguer dans l’arbre',
    body: (
      <p>
        Cliquez sur un nœud pour sélectionner une sous-expression. Maintenez <kbd>Space</kbd> pour déplacer la vue sans
        survoler les nœuds ; zoomez avec la molette. Les couleurs indiquent le rôle linguistique (logique,
        identifiants, expressions typées et composées) — liste complète dans l&apos;
        <TourHelpLink text='aide' topic={HelpTopic.UI_FORMULA_TREE} />.
      </p>
    )
  },
  extract: {
    title: 'Isoler une constituante',
    body: (
      <>
        <p>
          Disponible pour un nœud imbriqué avec des enfants (pas la racine) ; en mode lecture seule, le bouton est
          indisponible. Sélectionnez un tel nœud, puis appuyez sur <kbd>Q</kbd> ou cliquez{' '}
          <IconNewItem className='inline-icon' /> Isoler pour ouvrir le panneau d&apos;isolement et en faire une
          nouvelle constituante. Un second <kbd>Q</kbd> ferme le panneau.
        </p>
        <p>
          Dans le panneau d&apos;isolement, saisissez le nouveau terme (et éventuellement la nouvelle définition
          textuelle), puis confirmez avec <kbd>{saveHotkey}</kbd>. <kbd>Esc</kbd> ferme le panneau sans isoler.
        </p>
      </>
    )
  }
};
