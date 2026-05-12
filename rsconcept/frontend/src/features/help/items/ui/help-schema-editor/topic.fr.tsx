import { useTx } from '@/i18n';

import {
  IconChild,
  IconClone,
  IconCrucial,
  IconDatabase,
  IconDestroy,
  IconFilterReset,
  IconGraphCore,
  IconKeyboard,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOSS,
  IconPredecessor,
  IconReset,
  IconSave,
  IconSearch,
  IconStatusError,
  IconStatusOK,
  IconTree,
  IconTypeGraph
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaEditorFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.cst.edit.ui')}</h1>

      <div className='flex flex-col sm:flex-row sm:gap-3'>
        <div>
          <h2>{tx('tx.general.controls')}</h2>
          <ul>
            <li>
              <IconCrucial className='inline-icon' /> statut clé
            </li>
            <li>
              <IconDatabase className='inline-icon' /> classe{' '}
              <LinkTopic text='interprétabilité' topic={HelpTopic.RSL_INTERPRET} />
            </li>
            <li>
              <IconOSS className='inline-icon' /> accéder au <LinkTopic text='SOS' topic={HelpTopic.CC_OSS} />
            </li>
            <li>
              <IconPredecessor className='inline-icon' /> accéder à la source
            </li>
            <li>
              <IconSave className='inline-icon' /> enregistrer : <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
            </li>
            <li>
              <IconReset className='inline-icon' /> annuler les modifications
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> cloner : <kbd>Alt + V</kbd>
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> nouveau constituant
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> supprimer
            </li>
          </ul>
        </div>

        <div>
          <h2>Liste des constituants</h2>
          <ul>
            <li>
              <IconMoveDown className='inline-icon' />
              <IconMoveUp className='inline-icon' /> <kbd>Alt + Haut/Bas</kbd>
            </li>
            <li>
              <IconFilterReset className='inline-icon' /> effacer le filtre
            </li>
            <li>
              <IconSearch className='inline-icon' /> filtrer par attributs
            </li>
            <li>
              <IconStatusError className='inline-icon' /> concepts problématiques
            </li>
            <li>
              <IconGraphCore className='inline-icon' /> concepts primitifs
            </li>
            <li>
              <IconCrucial className='inline-icon' /> constituants clés
            </li>
            <li>
              <IconChild className='inline-icon' /> hérités
            </li>
            <li>
              <span className='cc-sample-color bg-selected' />
              constituant sélectionné
            </li>
            <li>
              <span className='cc-sample-color bg-accent-green50' />
              <LinkTopic text='base' topic={HelpTopic.CC_RELATIONS} /> du sélectionné
            </li>
            <li>
              <span className='cc-sample-color bg-accent-orange50' />
              <LinkTopic text='générés' topic={HelpTopic.CC_RELATIONS} /> du sélectionné
            </li>
          </ul>
        </div>
      </div>

      <h2>Définition formelle</h2>
      <ul>
        <li>
          <IconStatusOK className='inline-icon' /> indicateur de statut de définition en haut
        </li>
        <li>
          <IconKeyboard className='inline-icon' /> clavier spécial et raccourcis
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> afficher le{' '}
          <LinkTopic text='graphe de niveaux de typification' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> afficher l'{' '}
          <LinkTopic text='arbre syntaxique' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + Espace' : 'Ctrl + Espace'}</kbd> insérer un nom libre / remplacer une projection
        </li>
      </ul>

      <h2>Terme et définition textuelle</h2>
      <ul>
        <li>
          Modifier le <LinkTopic text='Nom' topic={HelpTopic.CC_CONSTITUENTA} /> /{' '}
          <LinkTopic text='Terme' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <kbd>Alt + 1</kbd> modifier les références
        </li>
        <li>
          <kbd>Alt + 2</kbd> modifier les mots associés
        </li>
      </ul>
    </>
  );
}
