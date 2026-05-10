import { useTx } from '@/i18n';

import {
  IconCalculateAll,
  IconCalculateOne,
  IconDatabase,
  IconDestroy,
  IconDownload,
  IconReset,
  IconSave,
  IconText,
  IconTree,
  IconTypeGraph,
  IconUpload
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelValueFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.data')}</h1>
      <p>Ici vous pouvez consulter et modifier la valeur d'un constituant</p>
      <p>
        Pour calculer une valeur, cliquez sur le <LinkTopic text='statut' topic={HelpTopic.UI_EVAL_STATUS} />
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconCalculateOne className='inline-icon icon-green' /> calculer le constituant actuel :{' '}
          <kbd>{isMac() ? 'Cmd + Q' : 'Ctrl + Q'}</kbd>
        </li>
        <li>
          <IconDatabase className='inline-icon' /> dialogue pour voir ou modifier la valeur
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> supprimer la valeur enregistrée
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> recalculer le modèle entier : <kbd>Alt + Q</kbd>
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
          <IconSave className='inline-icon' /> enregistrer la valeur : <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconReset className='inline-icon' /> annuler les modifications
        </li>
        <li>
          <IconUpload className='inline-icon' /> importer la valeur depuis le presse-papiers ou un fichier
        </li>
        <li>
          <IconDownload className='inline-icon' /> exporter la valeur vers le presse-papiers ou un fichier
        </li>
        <li>
          <IconText className='inline-icon' /> afficher texte ou identifiants
        </li>
      </ul>
    </>
  );
}
