import { useTx } from '@/i18n';

import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpStructurePlannerFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.expandStructure.noun')}</h1>
      <p>
        Un dialogue plein écran pour travailler avec la structure de typification d'un{' '}
        <LinkTopic text='constituant' topic={HelpTopic.CC_CONSTITUENTA} /> sélectionné. Un graphe d'opérations
        (projections petites et grandes, ensemble-somme) est construit à partir de l'arbre de typification. Les nœuds
        correspondent aux éléments structurels ; pour chacun d'eux, sa définition formelle, sa désignation (nom) et son{' '}
        <LinkTopic text='terme' topic={HelpTopic.CC_CONSTITUENTA} /> sont affichés.
      </p>
      <p>
        Le dialogue s'ouvre depuis l'onglet « Concept » via le bouton « Typification » (si le constituant possède une
        structure) ou depuis le menu du schéma via la commande « Générer la structure ».
      </p>

      <h2>{tx('tx.graph')}</h2>
      <ul>
        <li>clic sur un nœud pour sélectionner un élément structurel</li>
        <li>
          si un constituant existe déjà pour cet élément, il est substitué ; sinon, un nom pour un nouveau constituant
          est proposé
        </li>
        <li>la racine du graphe est le constituant ouvert (pour une terme-fonction — le type du résultat)</li>
        <li>
          si le constituant est <LinkTopic text='généré' topic={HelpTopic.CC_RELATIONS} />, la racine est la structure de
          la base
        </li>
      </ul>

      <h2>Panneau supérieur</h2>
      <ul>
        <li>à gauche — définition formelle de l'élément sélectionné</li>
        <li>les références textuelles sont prises en charge dans le champ terme</li>
        <li>
          dans le champ terme : <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd> — enregistrer le terme ou créer le
          constituant
        </li>
      </ul>
    </>
  );
}
