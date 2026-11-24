import { HelpTopic } from '@/features/help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';

import {
  IconConceptBlock,
  IconDestroy,
  IconEdit2,
  IconFitImage,
  IconImage,
  IconNewItem,
  IconReset,
  IconSave,
  IconSettings,
  IconSynthesis
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const ossGraphContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Graphe OSS',
    body: (
      <p>
        Sur le <TourHelpLink text='graphe OSS' topic={HelpTopic.UI_OSS_GRAPH} /> se construit le schéma opérationnel de
        synthèse : blocs, chargements, nœuds de synthèse et réplications. Métadonnées, accès et statistiques — onglet
        « Passeport ».
      </p>
    )
  },
  view: {
    title: 'Contrôles d’affichage',
    body: (
      <>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) — Annuler les modifications ;{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) ajuste le graphe à l&apos;écran ;{' '}
          <IconSettings className='inline-icon' /> Paramètres : coordonnées, grille (<kbd>X</kbd>), animation des liens,
          forme des liens (<kbd>T</kbd>) ; <IconImage className='inline-icon' /> — Enregistrer l&apos;image (PNG ou SVG).
        </p>
      </>
    )
  },
  edit: {
    title: 'Créer et éditer les nœuds',
    body: (
      <>
        <p>
          Lorsque l&apos;édition est autorisée, la deuxième ligne de la barre : <IconSave className='inline-icon' /> (
          <kbd>Ctrl + S</kbd>) — Enregistrer les modifications ; <IconEdit2 className='inline-icon' /> ouvre le même
          menu qu&apos;un clic droit sur le nœud sélectionné ;{' '}
          <IconNewItem className='inline-icon icon-green' /> Ajouter… —{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> nouveau bloc, nouveau SC, import de schéma ou{' '}
          <IconSynthesis className='inline-icon' /> synthèse ; <IconDestroy className='inline-icon icon-red' />{' '}
          supprime la sélection. Sans droits d&apos;édition — voir l&apos;accès dans le passeport.
        </p>
        <p>
          Le menu contextuel couvre aussi Exécuter la synthèse, Créer une réplique, Cloner, Constituentes (
          <TourHelpLink text='déplacer entre schémas' topic={HelpTopic.UI_RELOCATE_CST} />) et l&apos;ouverture du
          schéma lié — voir le <TourHelpLink text='manuel du graphe OSS' topic={HelpTopic.UI_OSS_GRAPH} />.
        </p>
      </>
    )
  },
  canvas: {
    title: 'Travail sur le canevas',
    body: (
      <>
        <p>
          Un clic sélectionne un nœud ; <kbd>Shift</kbd>+clic étend la sélection. Un double-clic ouvre le schéma lié (ou
          l&apos;éditeur de bloc). Faites glisser les nœuds ; tirez depuis un point de connexion vers un nœud de
          synthèse pour ajouter un argument.
        </p>
        <p>
          Déplacez la vue avec <kbd>Space</kbd>, zoomez avec la molette, effacez la sélection avec <kbd>Esc</kbd>,
          supprimez avec <kbd>Delete</kbd> si l&apos;édition est autorisée.
        </p>
      </>
    )
  },
  sidebar: {
    title: 'Panneau de contenu',
    body: (
      <p>
        Appuyez sur <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> ou <kbd>V</kbd> pour
        ouvrir le <TourHelpLink text='panneau de contenu' topic={HelpTopic.UI_OSS_SIDEBAR} /> : édition des
        constituantes du schéma de l&apos;opération sélectionnée — filtre, création, clone, suppression, ordre, graphe
        des termes et graphe des échelons. Sélectionnez une opération avec un schéma lié pour remplir le panneau.
      </p>
    )
  }
};
