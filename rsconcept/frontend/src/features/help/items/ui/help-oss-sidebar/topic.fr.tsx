import { useTx } from '@/i18n';

import {
  IconClone,
  IconDestroy,
  IconEdit,
  IconGenerateNames,
  IconLeftOpen,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconRSForm,
  IconSortList,
  IconTree,
  IconTypeGraph
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpOssSidebarFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.sidebar.contents')}</h1>
      <p className='m-0'>
        <IconLeftOpen className='inline-icon' />
        {'\u2009'} Le panneau latéral du SOS permet de modifier rapidement le contenu d'un{' '}
        <LinkTopic text='Schéma Conceptuel' topic={HelpTopic.CC_SYSTEM} /> sans y accéder directement.
      </p>
      <p className='mt-1'>
        La partie supérieure du panneau permet de filtrer la liste des constituants de la même manière que l'
        <LinkTopic text='éditeur de constituants' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
      </p>
      <ul>
        <li>
          <IconRSForm className='inline-icon' /> menu de modification du schéma conceptuel
        </li>
        <li>
          <IconSortList className='inline-icon' /> trier les constituants
        </li>
        <li>
          <IconGenerateNames className='inline-icon' /> renuméroter
        </li>
        <li>
          <IconEdit className='inline-icon' /> modifier les constituants
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> nouveau constituant
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> cloner un constituant
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> supprimer des constituants
        </li>
        <li>
          <IconMoveDown className='inline-icon' />
          <IconMoveUp className='inline-icon' /> déplacer vers le haut/bas
        </li>
        <li>
          <IconTree className='inline-icon' />
          {'\u2009'}
          <LinkTopic text='graphe des termes' topic={HelpTopic.UI_GRAPH_TERM} />
        </li>
        <li>
          <IconTypeGraph className='inline-icon' />
          {'\u2009'}
          <LinkTopic text='graphe des types' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
      </ul>
    </>
  );
}
