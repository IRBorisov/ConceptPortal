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
        Le <TourHelpLink text='graphe des termes' topic={HelpTopic.UI_GRAPH_TERM} /> montre les relations entre
        constituantes : quelles définitions dépendent de quelles autres. Il aide à voir la structure du schéma dans son
        ensemble.
      </p>
    )
  },
  options: {
    title: 'Affichage et filtres',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          À gauche, choisissez la coloration des nœuds et les types de liens. <IconFitImage className='inline-icon' />{' '}
          adapte le graphe ; <IconFocus className='inline-icon' /> focalise une constituante ;{' '}
          <IconFilter className='inline-icon' /> ouvre les paramètres de disposition et de filtre.
        </p>
        <p>
          <IconText className='inline-icon' /> (<kbd>T</kbd>) bascule les libellés ;{' '}
          <IconClustering className='inline-icon' /> (<kbd>V</kbd>) masque les nœuds générés ;{' '}
          <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>) affiche uniquement le noyau
          axiomatique ; <IconImage className='inline-icon' /> exporte en PNG ou SVG.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Éditer les nœuds',
    body: (
      <p>
        Lorsque l&apos;édition est autorisée, <IconNewItem className='inline-icon icon-green' /> (<kbd>R</kbd>) crée
        une constituante ; <IconDestroy className='inline-icon icon-red' /> supprime la sélection ;{' '}
        <IconCrucial className='inline-icon' /> (<kbd>F</kbd>) bascule le statut crucial ;{' '}
        <IconTypeGraph className='inline-icon' /> ouvre le graphe des échelons pour la sélection.
      </p>
    )
  },
  hidden: {
    title: 'Nœuds masqués',
    body: (
      <p>
        Les constituantes filtrées hors du canevas apparaissent dans la liste masquée. Cliquez pour sélectionner, ou
        activez un élément pour ouvrir l&apos;éditeur de constituante.
      </p>
    )
  },
  tools: {
    title: 'Modes et sélection',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Explorer pour naviguer et
          sélectionner ; <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Éditer pour
          tracer des relations. Attribution et définition :{' '}
          <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> /{' '}
          <IconEdgeType value={TGEdgeType.definition} className='inline-icon' />.
        </p>
        <p>
          Les aides à la sélection étendent les nœuds liés — par exemple <IconGraphCollapse className='inline-icon' />{' '}
          influenceurs et <IconGraphExpand className='inline-icon' /> dépendants.
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
          vue avec <kbd>Space</kbd> ou <kbd>WASD</kbd>, et zoomez avec la molette.
        </p>
        <p>
          <kbd>Esc</kbd> efface la sélection ; <kbd>Delete</kbd> supprime les constituantes sélectionnées lorsque
          l&apos;édition est autorisée.
        </p>
      </div>
    )
  }
};
