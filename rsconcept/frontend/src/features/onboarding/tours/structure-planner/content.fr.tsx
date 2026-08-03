import { HelpTopic } from '@/features/help';

import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const structurePlannerContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Développement de structure',
    body: (
      <>
        <p>
          Le <TourHelpLink text='développement de structure' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> affiche un graphe
          d&apos;opérations à partir de la typification du constituant sélectionné (projections, ensemble-somme, etc.).
          Pour un constituant généré, la racine est la structure de la base.
        </p>
        <p>
          Le cercle du nœud montre un nom ; en dessous — le terme ou le type. Couleurs : violet — racine, vert —
          constituant déjà présent, orange — à créer. Cliquez sur un nœud pour sélectionner cet élément structurel.
        </p>
      </>
    )
  },
  panel: {
    title: 'Définition, terme et enregistrement',
    body: (
      <>
        <p>
          Le panneau supérieur affiche la définition formelle du nœud, son nom (abréviation) — vert s&apos;il est nouveau
          — et le champ terme avec références textuelles. Les constituantes existantes chargent leur terme enregistré ;
          pour un nouveau nœud le nom est attribué automatiquement, et vous saisissez le terme dans le champ.
        </p>
        <p>
          Lorsque l&apos;édition est autorisée, <IconSave className='inline-icon icon-primary' /> /{' '}
          <IconNewItem className='inline-icon icon-green' /> enregistre ou crée — depuis le champ terme,{' '}
          <kbd>{saveHotkey}</kbd> fait de même. <IconReset className='inline-icon icon-primary' /> annule les
          modifications du terme uniquement pour une constituante existante. Changer de nœud avec des modifications non
          enregistrées affiche d&apos;abord une invite.
        </p>
      </>
    )
  }
};
