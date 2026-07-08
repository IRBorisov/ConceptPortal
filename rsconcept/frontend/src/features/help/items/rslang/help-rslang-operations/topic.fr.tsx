import { useTx } from '@/i18n';

import {
  IconGenerateNames,
  IconGenerateStructure,
  IconInlineSynthesis,
  IconReplace,
  IconSortList,
  IconTemplates
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangOperationsFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.operation.hint')}</h1>
      <p>Cette section explique les différentes opérations sur les schémas conceptuels.</p>

      <h2>
        <IconSortList size='1.25rem' className='inline-icon' /> {tx('tx.schema.order.restore.short')}
      </h2>
      <ul>
        Ordonnancement de la liste des constituants selon les règles suivantes :
        <li>les ensembles de base et constants sont déclarés en premier</li>
        <li>
          les constituants du <LinkTopic text='Noyau' topic={HelpTopic.CC_SYSTEM} /> sont placés avant les autres
        </li>
        <li>
          <b>ordre topologique</b> : les dépendances de dérivation vont des déclarations antérieures aux postérieures
        </li>
        <li>
          les constituants <LinkTopic text='dérivés' topic={HelpTopic.CC_RELATIONS} /> suivent immédiatement leur source
        </li>
        <li>conservation maximale de l'ordre original sous réserve des règles précédentes</li>
      </ul>

      <h2>
        <IconGenerateNames size='1.25rem' className='inline-icon' /> {tx('tx.schema.order.rename')}
      </h2>
      <p>
        Génération des noms de constituants de sorte que l'ordre des indices corresponde à l'ordre de déclaration dans
        la liste. Par exemple, <code>{'Rename({X4, X2, D1, D3}) = {X1, X2, D1, D2}'}</code>.
      </p>

      <h2>
        <IconGenerateStructure size='1.25rem' className='inline-icon' /> {tx('tx.concept.expandStructure.noun')}
      </h2>
      <p>
        Génération de l'ensemble complet de termes déployant la structure du constituant sélectionné. L'opération est
        applicable aux termes, aux structures de genres et aux fonctions-terme avec une{' '}
        <LinkTopic text='typification' topic={HelpTopic.RSL_TYPIFICATION} /> d'ensemble ou de tuple.
        <br />
        <code>{'Generate(S1∈ℬ(X1×ℬ(X1))) = {Pr1(S1), Pr2(S1), red(Pr2(S1))}'}</code>
      </p>

      <h2>
        <IconReplace size='1.25rem' className='inline-icon' /> {tx('tx.substitution')}
      </h2>
      <p>
        Construction d'un tableau d'identification et application de celui-ci au schéma courant. En résultat, un
        certain nombre de constituants sont supprimés et leurs occurrences sont remplacées par d'autres.
      </p>

      <h2>
        <IconTemplates size='1.25rem' className='inline-icon' /> Générer depuis un modèle
      </h2>
      <p>
        Cette opération permet d'insérer un constituant depuis un{' '}
        <LinkTopic text="modèle d'expression" topic={HelpTopic.RSL_TEMPLATES} />.
      </p>

      <h2>
        <IconInlineSynthesis size='1.25rem' className='inline-icon' /> {tx('tx.schema.embed')}
      </h2>
      <p>
        Implémentation de l'opération de synthèse de schémas conceptuels au sein d'un seul schéma conceptuel.
        L'opération consiste à copier un sous-ensemble sélectionné de constituants du schéma source dans le schéma
        courant. Un tableau d'identification est également spécifié pour lier les constituants ajoutés au schéma
        courant.
      </p>
    </>
  );
}
