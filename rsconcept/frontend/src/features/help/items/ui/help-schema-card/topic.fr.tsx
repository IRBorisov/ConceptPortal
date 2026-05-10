import { useTx } from '@/i18n';

import { IconDestroy, IconEditor, IconFolderEdit, IconOSS, IconOwner, IconSave, IconShare } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaCardFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.passport')}</h1>

      <p>Le passeport contient des informations sur le schéma conceptuel et ses statistiques.</p>
      <p>
        Il permet de gérer les attributs et les <LinkTopic text='versions' topic={HelpTopic.VERSIONS} />.
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconOSS className='inline-icon' /> <LinkTopic text='SOS' topic={HelpTopic.CC_OSS} /> associé
        </li>
        <li>
          <IconSave className='inline-icon' /> enregistrer : <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> copier le lien
        </li>
        <li>
          <IconEditor className='inline-icon' /> éditeur — droit de modification
        </li>
        <li>
          <IconOwner className='inline-icon' /> propriétaire — accès complet
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> supprimer le schéma
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> changer l'emplacement
        </li>
      </ul>
    </>
  );
}
