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
        Sur le <TourHelpLink text='graphe OSS' topic={HelpTopic.UI_OSS_GRAPH} /> vous assemblez la synthèse
        opérationnelle : blocs, chargements, nœuds de synthèse et réplications.
      </p>
    )
  },
  view: {
    title: 'Contrôles d’affichage',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          <IconReset className='inline-icon' /> (<kbd>Z</kbd>) annule les déplacements non enregistrés ;{' '}
          <IconFitImage className='inline-icon' /> (<kbd>G</kbd>) adapte le graphe ;{' '}
          <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) ouvre le panneau de
          contenu ; <IconSettings className='inline-icon' /> — grille, lignes et animation ;{' '}
          <IconImage className='inline-icon' /> — export PNG ou SVG.
        </p>
      </div>
    )
  },
  edit: {
    title: 'Créer et éditer les nœuds',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Lorsque l&apos;édition est autorisée, <IconSave className='inline-icon' /> (<kbd>Ctrl + S</kbd>) enregistre
          les positions ; <IconEdit2 className='inline-icon' /> ouvre le même menu qu&apos;un clic droit sur le nœud
          sélectionné ; <IconNewItem className='inline-icon icon-green' /> ajoute un{' '}
          <IconConceptBlock className='inline-icon text-constructive' /> bloc, un schéma vide, un import de schéma ou
          une <IconSynthesis className='inline-icon' /> synthèse ; <IconDestroy className='inline-icon icon-red' />{' '}
          supprime la sélection.
        </p>
        <p>
          Le menu contextuel couvre aussi activation, réplication, clone de schéma, transfert de constituantes et
          ouverture du schéma lié — voir le <TourHelpLink text='manuel du graphe OSS' topic={HelpTopic.UI_OSS_GRAPH} />.
        </p>
      </div>
    )
  },
  canvas: {
    title: 'Travail sur le canevas',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Un clic sélectionne un nœud ; <kbd>Shift</kbd>+clic étend la sélection. Un double-clic ouvre le schéma lié (ou
          l&apos;éditeur de bloc). Faites glisser les nœuds ; tirez depuis une poignée vers un nœud de synthèse pour
          ajouter un argument.
        </p>
        <p>
          Déplacez la vue avec <kbd>Space</kbd>, zoomez avec la molette, effacez la sélection avec <kbd>Esc</kbd>,
          supprimez avec <kbd>Delete</kbd> si l&apos;édition est autorisée.
        </p>
      </div>
    )
  },
  sidebar: {
    title: 'Panneau de contenu',
    body: (
      <p>
        <IconShowSidebar value={true} isBottom={false} className='inline-icon' /> (<kbd>V</kbd>) ouvre le{' '}
        <TourHelpLink text='panneau de contenu' topic={HelpTopic.UI_OSS_SIDEBAR} /> : édition des constituantes du
        schéma de l&apos;opération sélectionnée — filtre, création, clone, suppression, ordre, graphe des termes et
        graphe des échelons. Sélectionnez une opération avec un schéma lié pour remplir le panneau.
      </p>
    )
  }
};
