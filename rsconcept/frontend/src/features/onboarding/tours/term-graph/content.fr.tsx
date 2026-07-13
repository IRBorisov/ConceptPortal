import { HelpTopic } from '@/features/help';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import {
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphExpand,
  IconOverviewCore
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
      <p>
        À gauche, choisissez la coloration des nœuds et les types de liens. <IconFitImage className='inline-icon' />{' '}
        adapte le graphe à l&apos;écran, <IconFocus className='inline-icon' /> focalise une constituante, et{' '}
        <IconFilter className='inline-icon' /> ouvre les paramètres de disposition et de filtre.
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
          <IconOverviewCore className='inline-icon icon-green' /> (<kbd>O</kbd>) affiche uniquement le noyau axiomatique
          — vue d&apos;ensemble pour les grands schémas ; la focale ouvre un sous-graphe local.
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
