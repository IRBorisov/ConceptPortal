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
        Le <TourHelpLink text='graphe des termes' topic={HelpTopic.UI_GRAPH_TERM} /> montre les liens entre
        constituantes par définition formelle et attribution — pratique pour voir la structure du schéma entière.
      </p>
    )
  },
  options: {
    title: 'Affichage et filtres',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          À gauche — coloration des nœuds et types de liens. <IconFitImage className='inline-icon' /> adapte le graphe ;{' '}
          <IconFocus className='inline-icon' /> focalise une constituante ; <IconFilter className='inline-icon' /> ouvre
          les paramètres de disposition et de filtre.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) bascule les libellés ;{' '}
          <IconClustering className='inline-icon' /> (<kbd>V</kbd>) masque les nœuds générés ;{' '}
          <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>) affiche uniquement le noyau axiomatique
          ; <IconImage className='inline-icon' /> exporte en PNG ou SVG.
        </p>
        <p>
          Essayez : basculez les <IconText className='inline-icon' /> libellés avec le bouton mis en évidence. Le guide
          continue automatiquement.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Éditer les nœuds',
    body: (
      <p>
        Lorsque l&apos;édition est autorisée, <IconNewItem className='inline-icon icon-green' /> (<kbd>R</kbd>) crée une
        constituante avec des liens vers les nœuds sélectionnés ; <IconDestroy className='inline-icon icon-red' />{' '}
        supprime la sélection ; <IconCrucial className='inline-icon' /> (<kbd>F</kbd>) bascule le statut crucial ;{' '}
        <IconTypeGraph className='inline-icon' /> ouvre le graphe des échelons pour la sélection.
      </p>
    )
  },
  hidden: {
    title: 'Nœuds masqués',
    body: (
      <p>
        Les constituantes filtrées hors du canevas apparaissent dans la liste masquée. Cliquez pour sélectionner ;
        double-clic pour ouvrir l&apos;éditeur de constituante.
      </p>
    )
  },
  tools: {
    title: 'Modes et sélection',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Consultation — navigation et
          sélection ; <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Édition — tracer
          des relations. <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> attribution /{' '}
          <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> définition.
        </p>
        <p>
          Les aides étendent les nœuds liés — par exemple <IconGraphCollapse className='inline-icon' /> tous les
          influenceurs et <IconGraphExpand className='inline-icon' /> tous les dépendants.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Nœuds et navigation',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Cliquez sur un nœud pour le sélectionner ; un double-clic ouvre l&apos;éditeur de constituante. Déplacez la
          vue avec <kbd>Space</kbd> ou <kbd>WASD</kbd>, zoomez avec la molette.
        </p>
        <p>
          <kbd>Esc</kbd> efface la sélection ; <kbd>Delete</kbd> supprime les constituantes sélectionnées lorsque
          l&apos;édition est autorisée.
        </p>
      </div>
    )
  }
};
