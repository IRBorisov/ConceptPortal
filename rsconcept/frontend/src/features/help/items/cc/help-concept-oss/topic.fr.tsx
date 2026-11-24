import { useTx } from '@/i18n';

import {
  IconConsolidation,
  IconDownload,
  IconExecute,
  IconOSS,
  IconRSFormImported,
  IconRSFormOwned,
  IconSynthesis
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptOSSFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss')}</h1>
      <p>
        Le travail avec des domaines d'application complexes nécessite des{' '}
        <LinkTopic text='synthèses' topic={HelpTopic.CC_SYNTHESIS} /> répétées pour construire les concepts cibles. La
        séquence des synthèses est spécifiée à l'aide d'un{' '}
        <span className='text-nowrap'>
          <IconOSS className='inline-icon' /> <b>Schéma Opérationnel de Synthèse (SOS)</b>
        </span>{' '}
        et est représentée sous forme de <LinkTopic text='Graphe de synthèse' topic={HelpTopic.UI_OSS_GRAPH} />.
      </p>
      <p>
        Les opérations de base du SOS sont le <IconDownload size='1rem' className='inline-icon' /> chargement et la{' '}
        <IconSynthesis size='1rem' className='inline-icon' /> synthèse. Un schéma peut être chargé depuis une autre
        emplacement{' '}
        <span className='text-nowrap'>
          (<IconRSFormImported size='1rem' className='inline-icon' />
          <b>SC externe</b>)
        </span>{' '}
        ou créé dans le SOS{' '}
        <span className='text-nowrap'>
          (<IconRSFormOwned size='1rem' className='inline-icon' />
          <b>SC propre</b>)
        </span>
        . Le chargement de schémas produits par synthèse dans d'autres SOS n'est pas autorisé. De même, le chargement
        répété du même SC au sein d'un seul SOS est interdit.
      </p>
      <p>
        Lorsque l'emplacement ou le propriétaire du SOS change, les attributs correspondants des SC propres changent en
        conséquence. Lors de la suppression d'un SOS, tous les SC propres sont également supprimés. Lors de la
        suppression d'une opération, le SC propre est détaché du SOS et devient un SC libre.
      </p>
      <p>
        Une opération de synthèse dans un SOS est définie par un ensemble d'opérations arguments et un{' '}
        <b>tableau d'identification</b> des concepts provenant des SC liés aux arguments sélectionnés. Ainsi les{' '}
        <LinkTopic text='constituants' topic={HelpTopic.CC_CONSTITUENTA} /> de chaque SC sont divisés en source et
        hérités. Lors de la construction du tableau d'identification, l'utilisateur est invité à synthétiser les
        concepts dérivés dont les expressions coïncident après application des identifications spécifiées.
      </p>
      <p>
        Après avoir défini les arguments et le tableau d'identification, il faut{' '}
        <span className='text-nowrap'>
          <IconExecute className='inline-icon icon-green' /> activer la Synthèse
        </span>{' '}
        une seule fois pour exécuter l'opération et activer les{' '}
        <LinkTopic text='modifications propagées' topic={HelpTopic.CC_PROPAGATION} />.
      </p>
      <p>
        <span className='text-nowrap'>
          <IconConsolidation className='inline-icon' /> <b>La synthèse en diamant</b>
        </span>{' '}
        désigne une opération dans laquelle des SC ayant des ancêtres communs sont utilisés. Une telle synthèse peut
        produire des doublons et des ambiguïtés. Le tableau d'identification doit être soigneusement construit en
        ajoutant les concepts dupliqués provenant des schémas synthétisés.
      </p>
    </>
  );
}
