import { HelpTopic } from '@/features/help';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import {
  IconClustering,
  IconCrucial,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphExpand,
  IconImage,
  IconNewItem,
  IconOverviewCore,
  IconText,
  IconTypeGraph
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const termGraphContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Graphe des termes',
    body: (
      <p>
        L&apos;onglet Graphe ouvre le <TourHelpLink text='graphe des termes' topic={HelpTopic.UI_GRAPH_TERM} /> : liens
        entre constituantes par définition formelle et attribution — pratique pour voir la structure entière du schéma.
      </p>
    )
  },
  tools: {
    title: 'Modes et sélection',
    body: (
      <>
        <p>
          Lorsque l&apos;édition est autorisée, la barre du haut propose{' '}
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Mode : consultation — navigation et
          sélection ; <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Mode : édition —
          tracer des relations. En mode édition, pour les schémas attributifs,{' '}
          <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> /{' '}
          <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> choisit le type du lien en cours de
          tracé.
        </p>
        <p>
          Dans le menu « Étendre à partir de la sélection… » — <IconGraphCollapse className='inline-icon' /> Influents
          et <IconGraphExpand className='inline-icon' /> Dépendants ; le menu nécessite une sélection non vide.
        </p>
      </>
    )
  },
  options: {
    title: 'Affichage et filtres',
    body: (
      <>
        <p>
          À gauche — coloration des nœuds et, pour les schémas attributifs, un filtre d&apos;affichage des liens.{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) ajuste le graphe à l&apos;écran ;{' '}
          <IconFocus className='inline-icon' /> focalise une constituante (ou clic droit sur un nœud) ;{' '}
          <IconFilter className='inline-icon' /> ouvre les paramètres de vue.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) bascule les libellés ;{' '}
          <IconClustering className='inline-icon' /> (<kbd>B</kbd>) masque les nœuds générés ;{' '}
          <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>) affiche uniquement le noyau axiomatique
          ; <IconImage className='inline-icon' /> exporte en PNG ou SVG.
        </p>
        <p>
          Essayez : basculez les <IconText className='inline-icon' /> libellés avec le bouton mis en évidence. Le guide
          continue automatiquement.
        </p>
      </>
    )
  },
  edit: {
    title: 'Éditer les nœuds',
    body: (
      <p>
        Lorsque l&apos;édition est autorisée, <IconNewItem className='inline-icon icon-green' /> (<kbd>R</kbd>) crée une
        constituante avec des liens vers les nœuds sélectionnés ; <IconDestroy className='inline-icon icon-red' />{' '}
        supprime la sélection ; <IconCrucial className='inline-icon' /> (<kbd>F</kbd>) bascule le statut crucial ;{' '}
        <IconTypeGraph className='inline-icon' /> ouvre le graphe des échelons des constituantes sélectionnées.
      </p>
    )
  },
  hidden: {
    title: 'Nœuds masqués',
    body: (
      <p>
        Les constituantes filtrées hors du canevas apparaissent dans la liste des nœuds masqués. Cliquez pour
        sélectionner ; double-clic pour ouvrir l&apos;édition de la constituante.
      </p>
    )
  },
  canvas: {
    title: 'Nœuds et navigation',
    body: (
      <>
        <p>
          Cliquez sur un nœud pour le sélectionner ; un double-clic ouvre l&apos;édition de la constituante. Déplacez la
          vue avec <kbd>Space</kbd> ou <kbd>WASD</kbd>, zoomez avec la molette.
        </p>
        <p>
          <kbd>Esc</kbd> efface la sélection ; <kbd>Delete</kbd> supprime les constituantes sélectionnées lorsque
          l&apos;édition est autorisée.
        </p>
      </>
    )
  }
};
