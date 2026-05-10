import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import {
  IconAlias,
  IconClone,
  IconDestroy,
  IconDownload,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconOSS,
  IconReset
} from '@/components/icons';

import { InfoCstStatus } from '../../../components/info-cst-status';
import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaListFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.list')}</h1>
      <ul>
        <li>
          <IconAlias className='inline-icon' />
          Les constituants possèdent un <LinkTopic text='Nom' topic={HelpTopic.CC_CONSTITUENTA} /> unique
        </li>
        <li>le survol d'un nom affiche ses attributs</li>
        <li>
          les constituants <LinkTopic text='hérités' topic={HelpTopic.CC_OSS} /> sont affichés en pointillés
        </li>
      </ul>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconOSS className='inline-icon' /> accéder au <LinkTopic text='SOS' topic={HelpTopic.CC_OSS} /> associé
        </li>
        <li>
          <IconReset className='inline-icon' /> désélectionner : <kbd>ESC</kbd>
        </li>
        <li>Clic sur une ligne pour la sélectionner</li>
        <li>
          <kbd>Shift + clic</kbd> pour sélectionner plusieurs lignes
        </li>
        <li>
          <kbd>Alt + clic</kbd> – Éditeur
        </li>
        <li>
          <kbd>Double clic</kbd> – Éditeur
        </li>
        <li>
          <IconMoveUp className='inline-icon' />
          <IconMoveDown className='inline-icon' /> <kbd>Alt + Haut/Bas</kbd> – déplacer
        </li>

        <li>
          <IconClone className='inline-icon icon-green' /> cloner la sélection : <kbd>Alt + V</kbd>
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> nouveau constituant : <kbd>Alt + `</kbd>
        </li>
        <li>
          <IconOpenList className='inline-icon icon-green' /> ajout rapide : <kbd>Alt + 1-6,W,E</kbd>
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> supprimer la sélection : <kbd>Delete</kbd>
        </li>
        <li>
          <IconDownload className='inline-icon' /> exporter le tableau dans un fichier
        </li>
      </ul>

      <Divider margins='my-2' />

      <InfoCstStatus title='Statuts' />
    </>
  );
}
