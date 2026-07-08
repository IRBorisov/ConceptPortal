import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRSModelFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model')}</h1>
      <p>
        Un <b>modèle conceptuel</b> combine un <LinkTopic text='schéma conceptuel' topic={HelpTopic.CC_SYSTEM} /> avec
        une <em>interprétation</em> de ses concepts dans le domaine d'application. Théoriquement, il s'agit d'une paire
        (schéma, interprétation) : le schéma définit la signature et les définitions, le modèle attribue des porteurs
        finis (ensembles, données structurées) aux concepts de base et fixe quels objets comptent comme valeurs de
        termes et quelles formules sont vraies dans une situation donnée. Les concepts dérivés ne sont pas spécifiés
        séparément : leurs valeurs sont calculées à partir des définitions du schéma sous l'interprétation choisie des
        concepts de base.
      </p>

      <p>
        Le schéma conceptuel répond à la question « quoi est défini et comment », tandis que le modèle répond à «
        quelles valeurs ces concepts prennent-ils maintenant ». Ensemble, ils permettent de vérifier la cohérence des
        données avec les définitions, de mener des expériences avec des expressions et de recalculer automatiquement les
        valeurs le long du graphe de dépendances entre constituants.
      </p>

      <h2>Fonctionnement du modèle</h2>
      <p>
        Le modèle stocke la valeur courante de chaque constituant sous forme de données structurées (nombres, tuples,
        ensembles finis — collections ordonnées d'éléments). Les ensembles de base sont des listes d'éléments. Les
        structures de genres sont peuplées à partir de ces éléments. Les valeurs des autres concepts sont calculées à
        partir des définitions dans l'ordre topologique des dépendances si nécessaire. Les constituants fonctionnels
        agissent comme des sous-programmes : à l'appel, un contexte local d'arguments est créé et le corps est évalué de
        la même manière que n'importe quelle formule.
      </p>
      <p>
        Les expressions RSLang sont évaluées en parcourant l'arbre syntaxique : les noms globaux sont pris dans le
        contexte du modèle, les quantificateurs et les constructions d'itération énumèrent les éléments des ensembles
        finis déjà construits, les définitions récursives sont traitées de manière itérative jusqu'à convergence. L'
        <LinkTopic text="onglet d'évaluation des expressions" topic={HelpTopic.UI_MODEL_EVALUATOR} /> permet de vérifier
        n'importe quelle formule dans le contexte du modèle courant.
      </p>

      <h2>Limitations du calcul</h2>
      <p>
        Une sémantique <em>finie</em> est utilisée : tous les ensembles en mémoire sont finis et explicitement énumérés.
        Les domaines infinis (par ex. l'ensemble de tous les entiers) ne sont pas pris en charge. Un emboîtement profond
        d'itérations ou de récursions, ainsi que de grands produits cartésiens, augmentent le nombre d'étapes ; si la
        limite est dépassée, le calcul est interrompu avec une erreur. Si le produit des cardinalités des facteurs est
        trop grand, le produit cartésien n'est pas construit.
      </p>
      <p>
        L'opérateur booléen (<code className='text-sm'>B(X)</code>, l'ensemble des parties de X) donne théoriquement 2
        <sup>|X|</sup> éléments. Dans le système, il est <em>entièrement matérialisé</em> : tous les sous-ensembles sont
        énumérés et stockés. Même pour un X modéré, cela croît exponentiellement en mémoire et en temps ; avec des
        booléens imbriqués, la croissance est encore plus rapide. Par conséquent, une limite stricte est imposée sur la
        cardinalité de l'argument booléen : si X est trop grand, la construction de{' '}
        <code className='text-sm'>B(X)</code> est rejetée et l'expression doit être réécrite.
      </p>
      <p>Conclusion : le modèle sert à la vérification exécutable des définitions sur des données finies réelles.</p>
    </>
  );
}
