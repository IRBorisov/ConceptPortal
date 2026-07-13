import { useTx } from '@/i18n';

import { IconCrucialValue } from '@/features/rsform/components/icon-crucial-value';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import { Divider } from '@/components/container';
import {
  IconChild,
  IconClustering,
  IconContextSelection,
  IconCrucial,
  IconDestroy,
  IconEdit,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphCore,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphMaximize,
  IconGraphOutputs,
  IconGroupSelection,
  IconImage,
  IconNewItem,
  IconOSS,
  IconOverviewCore,
  IconPredecessor,
  IconReset,
  IconText,
  IconTypeGraph
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaGraphFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.termGraph')}</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-75'>
          <h2>Paramètres du graphe</h2>
          <ul>
            <li>Couleur – coloration des nœuds</li>
            <li>
              Liens – choix des types de <LinkTopic text='relations' topic={HelpTopic.CC_RELATIONS} />
            </li>
            <li>
              <IconFilter className='inline-icon' /> Ouvrir les paramètres
            </li>
            <li>
              <IconFocus className='inline-icon' /> Définir le focus
            </li>
            <li>
              <IconOverviewCore className='inline-icon icon-green' /> <kbd>O</kbd> –{' '}
              <LinkTopic text='noyau axiomatique' topic={HelpTopic.CC_SYSTEM} /> seul (vue d&apos;ensemble)
            </li>
            <li>
              <IconFitImage className='inline-icon' /> Ajuster à l'écran
            </li>
            <li>
              <IconText className='inline-icon' /> Affichage du texte
            </li>
            <li>
              <IconClustering className='inline-icon' /> Masquer les générés
            </li>
            <li>
              <IconTypeGraph className='inline-icon' /> Ouvrir le{' '}
              <LinkTopic text='graphe de types' topic={HelpTopic.UI_TYPE_GRAPH} />
            </li>
            <li>
              <IconImage className='inline-icon' /> Enregistrer l'image
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-75'>
          <h2>Modification des nœuds</h2>
          <ul>
            <li>Clic sur un nœud pour le sélectionner</li>
            <li>Clic gauche – constituant en focus</li>
            <li>
              <IconReset className='inline-icon' /> <kbd>Esc</kbd> – désélectionner
            </li>
            <li>
              <IconEdit className='inline-icon' /> Double clic – modifier
            </li>
            <li>
              <IconCrucialValue value={true} className='inline-icon' /> <kbd>F</kbd> – basculer le statut clé
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> <kbd>Delete</kbd> – supprimer la sélection
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> Nouveau avec liens vers la sélection
            </li>
          </ul>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-75'>
          <h2>Général</h2>
          <ul>
            <li>
              <kbd>Space</kbd> – déplacer la vue
            </li>
            <li>
              <kbd>WASD</kbd> - navigation directionnelle
            </li>
            <li>
              <IconOSS className='inline-icon' /> accéder au <LinkTopic text='SOS' topic={HelpTopic.CC_OSS} /> associé
            </li>
            <li>
              <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> Voir le graphe
            </li>
            <li>
              <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Modifier les relations
            </li>
            <li>
              <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> Attribution
            </li>
            <li>
              <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> Définition
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-75'>
          <h2>Sélection</h2>
          <ul>
            <li>
              <IconContextSelection className='inline-icon' /> sélectionner les liés...
            </li>
            <li>
              <IconGraphCollapse className='inline-icon' /> tous les influençants
            </li>
            <li>
              <IconGraphExpand className='inline-icon' /> tous les dépendants
            </li>
            <li>
              <IconGraphMaximize className='inline-icon' /> dépendants uniquement de la sélection
            </li>
            <li>
              <IconGraphInputs className='inline-icon' /> entrées directes
            </li>
            <li>
              <IconGraphOutputs className='inline-icon' /> sorties directes
            </li>
            <li>
              <IconGroupSelection className='inline-icon' /> sélectionner les groupes...
            </li>
            <li>
              <IconGraphCore className='inline-icon' /> sélectionner le{' '}
              <LinkTopic text='Noyau' topic={HelpTopic.CC_SYSTEM} />
            </li>
            <li>
              <IconCrucial className='inline-icon' /> sélectionner les constituants clés
            </li>
            <li>
              <IconPredecessor className='inline-icon' /> sélectionner les{' '}
              <LinkTopic text='propres' topic={HelpTopic.CC_PROPAGATION} />
            </li>
            <li>
              <IconChild className='inline-icon' /> sélectionner les{' '}
              <LinkTopic text='hérités' topic={HelpTopic.CC_PROPAGATION} />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
