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
        Le <TourHelpLink text='graphe OSS' topic={HelpTopic.UI_OSS_GRAPH} /> sert à composer la synthèse opérationnelle
        : blocs, schémas d&apos;entrée, nœuds de synthèse et répliques. Le passeport décrit seulement l&apos;OSS ; la
        structure se construit ici.
      </p>
    )
  },
  view: {
    title: 'Contrôles d&apos;affichage',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) annule les déplacements non enregistrés ;{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) ajuste le graphe ;{' '}
          <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) ouvre le panneau de
          contenu ; <IconSettings className='inline-icon' /> — grille, lignes et animation ;{' '}
          <IconImage className='inline-icon' /> — export PNG ou SVG.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Créer et modifier des nœuds',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          En mode édition, <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) enregistre les positions ;{' '}
          <IconEdit2 className='inline-icon' /> ouvre le même menu qu&apos;un clic droit sur le nœud sélectionné ;{' '}
          <IconNewItem className='inline-icon icon-green' /> ajoute un{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> bloc, un schéma vide, une importation ou un
          nœud de <IconSynthesis className='inline-icon' /> synthèse ; <IconDestroy className='inline-icon icon-red' />{' '}
          supprime la sélection.
        </p>
        <p>
          Le menu contextuel couvre aussi activation, réplique, clonage de SC, relocation et ouverture du schéma lié —
          voir le <TourHelpLink text='manuel du graphe OSS' topic={HelpTopic.UI_OSS_GRAPH} />.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Interactions sur le canevas',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Un clic sélectionne un nœud ; <kbd>Shift</kbd>+clic étend la sélection. Un double-clic ouvre le schéma
          conceptuel lié (ou l&apos;éditeur de bloc). Déplacez les nœuds ; tirez depuis une poignée vers un nœud de
          synthèse pour connecter un argument.
        </p>
        <p>
          Déplacez le canevas avec <kbd>Space</kbd>, zoomez avec la molette, effacez la sélection avec <kbd>Esc</kbd>,
          et supprimez avec <kbd>Delete</kbd> si l&apos;édition est autorisée.
        </p>
      </div>
    )
  },
  sidebar: {
    title: 'Panneau de contenu',
    body: (
      <p>
        <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) ouvre le{' '}
        <TourHelpLink text='panneau de contenu' topic={HelpTopic.UI_OSS_SIDEBAR} /> : éditer les constituants du schéma
        de l&apos;opération sélectionnée sans quitter l&apos;OSS — filtre, création, clonage, suppression,
        réordonnancement, graphes de termes et de types. Sélectionnez une opération liée à un SC pour remplir le
        panneau.
      </p>
    )
  }
};
