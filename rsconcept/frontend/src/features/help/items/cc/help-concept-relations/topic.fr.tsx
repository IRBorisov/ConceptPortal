import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelationsFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.relation.plural')}</h1>
      <p>
        La relation la plus générale entre les constituants est l'association établie entre un nominoïde et d'autres
        constituants qui lui sont attribués. Cette relation est fixée avant que les définitions précises ne soient
        formulées et sert à regrouper préliminairement des constituants liés.
      </p>
      <p>
        Les constituants sont également liés entre eux par l'utilisation de certains constituants dans la définition
        d'autres. Cette relation est généralement appelée <b>utilisé dans la définition</b>. Elle constitue la base de
        la construction du <b>Graphe des termes</b>, qui représente la séquence de dérivation des concepts dans le
        schéma conceptuel.
      </p>

      <p>
        Si une expression formelle n'utilise que des formules structurelles de base, cette définition est dite « simple
        » ou « strictement formelle ». Pour construire de telles définitions, il suffit d'appliquer formellement les
        constructions du langage ; aucune nouvelle convention sur le contenu du domaine n'est nécessaire.
      </p>
      <p>
        Cette façon de construire des définitions est appelée <b>déploiement formel</b> et est souvent utilisée pour
        décrire des concepts à structure complexe et pour générer des{' '}
        <LinkTopic text='variétés' topic={HelpTopic.CC_SYSTEM} />.
      </p>
      <p>
        Si un concept est défini en utilisant un seul autre concept par une définition simple, il est appelé{' '}
        <b>dérivé</b>, et le concept source est appelé sa <b>base</b>.
      </p>
      <p>
        Une autre méthode de définition est appelée déploiement substantiel (déductif). Elle emploie des constructions
        plus complexes impliquant l'énumération d'objets et la vérification de leurs propriétés à l'aide de conditions
        logiques. Dans RSLang, de telles constructions comprennent les expressions quantifiées, les définitions
        déclaratives, impératives et récursives.
      </p>
      <p>
        La <b>relation genre–espèce</b> entre les concepts est formalisée par une définition dans laquelle les éléments
        d'un ensemble correspondant au concept de genre sont filtrés par une condition pour former les éléments du
        concept d'espèce.
      </p>
    </>
  );
}
