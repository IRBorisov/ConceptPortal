import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpCstAttributesFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.cst.attribute.plural')}</h1>
      <p>
        <b>Terme</b> peut être attribué à tout constituant. Il est utilisé dans d'autres Termes et dans les définitions
        textuelles.
      </p>
      <p>
        <b>Définition formelle</b> est construite à l'aide de l'appareil formel de l'
        <LinkTopic text='RSLang' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        <b>Typification</b> est calculée automatiquement sur la base de la définition formelle et reflète la structure
        des éléments de l'ensemble défini par cette définition. Elle peut également être saisie manuellement pour les
        constituants dont la définition n'a pas encore été saisie.
      </p>
      <p>
        <b>Définition textuelle</b> est fournie pour les constituants possédant une définition formelle ou un domaine.
        Il s'agit d'une interprétation textuelle de la définition formelle, construite à partir de mots de liaison, de
        termes de la théorie des ensembles et de références aux termes des constituants précédemment introduits.
      </p>
      <p>
        <b>Convention</b> est un accord sur la mise en correspondance d'un concept indéfini avec des entités du domaine
        d'application.
      </p>
      <p>
        <b>Commentaire</b> peut être ajouté à tout concept dérivé pour stocker des informations supplémentaires.
      </p>

      <h2>Concepts indéfinis</h2>
      <p>
        <code>X1, C1</code> — Les ensembles de base et les ensembles constants n'ont pas de structure complexe et sont
        définis par la Convention. Les éléments des ensembles constants participent aux opérations arithmétiques et aux
        prédicats d'ordre au même titre que les cardinalités des ensembles.
      </p>
      <p>
        <code>S1 :∈ ℬ(X1)</code> — Les structures de genres sont définies par un Domaine, une Convention et un ensemble
        d'Axiomes, ainsi qu'un Terme. Selon la Convention, les éléments de la structure de genre sont peuplés à partir
        du Domaine de sorte que les Axiomes soient satisfaits. Une structure de genre peut être un ensemble, un élément
        ou un tuple.
      </p>
      <p>
        <code>A1 :== ∀(α,β)∈S1 (β,α)∈S1</code> — Les Axiomes sont définis par une définition formelle logique et, si
        nécessaire, une Convention.
      </p>
      <h2>Concepts dérivés</h2>
      <p>
        <code>D1 :== Pr1(S1)</code> — Les termes sont définis par une définition formelle typée.
      </p>
      <p>
        <code>T1 :== Pr1(S1)=Pr2(S1)</code> — Les énoncés sont définis par une définition formelle logique.
      </p>
      <p>
        <code>F1 :== [σ∈ℬ(X1×X1)] Pr1(σ)\Pr2(σ)</code>
        <br />
        Les fonctions-terme sont définies par une définition formelle typée paramétrée.
      </p>
      <p>
        <code>P1 :== [σ∈ℬ(X1×X1)] card(Pr1(σ)) = card(σ)</code>
        <br />
        Les fonctions-prédicat sont définies par une définition formelle logique paramétrée.
      </p>
    </>
  );
}
