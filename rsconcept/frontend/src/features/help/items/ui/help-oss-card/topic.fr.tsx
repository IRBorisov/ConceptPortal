import { useTx } from '@/i18n';

import { IconDestroy, IconEditor, IconFolderEdit, IconOwner, IconSave, IconShare } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpOssCardFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.passport')}</h1>

      <p>
        Le passeport contient des informations sur le schéma opérationnel de synthèse dans la bibliothèque et des
        statistiques récapitulatives sur les opérations.
      </p>
      <p>
        Les champs du formulaire, le bloc « Accès » et l'emplacement fonctionnent de manière analogue au&nbsp;
        <LinkTopic text='passeport du schéma conceptuel' topic={HelpTopic.UI_SCHEMA_CARD} />.
      </p>
      <p>
        La composition des opérations et le graphe des relations sont modifiés&nbsp;
        <LinkTopic text='dans la vue graphe du SOS' topic={HelpTopic.UI_OSS_GRAPH} /> et&nbsp;
        <LinkTopic text='dans le panneau latéral' topic={HelpTopic.UI_OSS_SIDEBAR} />.
      </p>

      <h2>Spécificités du SOS</h2>
      <ul>
        <li>
          La zone latérale de statistiques (bouton de déploiement du panneau) indique le nombre d'opérations par type
          (blocs, chargement, synthèse, réplique) et un récapitulatif des schémas conceptuels liés (total, propres,
          importés).
        </li>
        <li>
          Les bases théoriques de la synthèse sont exposées dans&nbsp;
          <LinkTopic text='Schéma opérationnel de synthèse' topic={HelpTopic.CC_OSS} />.
        </li>
      </ul>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconSave className='inline-icon' /> enregistrer : <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd>
        </li>
        <li>
          <IconShare className='inline-icon' /> copier le lien vers le SOS
        </li>
        <li>
          <IconEditor className='inline-icon' /> éditeur — droit de modification
        </li>
        <li>
          <IconOwner className='inline-icon' /> propriétaire — accès complet
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> supprimer de la base de données du Portail
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> modifier l'emplacement
        </li>
      </ul>
    </>
  );
}
