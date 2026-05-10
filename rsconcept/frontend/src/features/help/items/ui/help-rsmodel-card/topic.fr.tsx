import { useTx } from '@/i18n';

import {
  IconDestroy,
  IconEditor,
  IconFolderEdit,
  IconOwner,
  IconRSForm,
  IconSave,
  IconShare
} from '@/components/icons';
import { isMac } from '@/utils/utils';

export function HelpRSModelCardFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.passport')}</h1>
      <p>Contient les informations essentielles et les statistiques du modèle.</p>
      <p>Le nom et les attributs du schéma conceptuel source ne sont pas modifiables ici.</p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconSave className='inline-icon' /> enregistrer : <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> copier le lien
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> supprimer de la base de données du Portail
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> changer l'emplacement
        </li>
        <li>
          <IconEditor className='inline-icon' /> éditeurs du modèle
        </li>
        <li>
          <IconOwner className='inline-icon' /> changer le propriétaire
        </li>
        <li>
          <IconRSForm className='inline-icon' /> accéder au schéma conceptuel
        </li>
      </ul>
    </>
  );
}
