import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangExpressionStructureFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.structure')}</h1>
      <p>
        Les expressions structurelles de RSLang sont utilisées pour les transformations qui
        modifient la <LinkTopic topic={HelpTopic.RSL_TYPIFICATION} text='typification' /> des arguments, permettant de
        générer des concepts structurellement dépendants ou structurellement nouveaux.
      </p>

      <h2>Formation de structures</h2>
      <ul>
        <li>
          <b>Booléen / Ensemble des parties</b> : <code>ℬ(X1)</code> — ensemble de tous les sous-ensembles de{' '}
          <code>X1</code>.
        </li>
        <li>
          <b>Produit cartésien</b> : <code>X1×X2</code> — ensemble de toutes les paires d'éléments de{' '}
          <code>X1</code> et <code>X2</code>.
        </li>
        <li>
          <b>Tuple</b> : <code>(a, b, c)</code> — n-uplet ordonné (n ≥ 2).
        </li>
        <li>
          <b>Énumération</b> : <code>{'{a, b, c}'}</code> — n-uplet non ordonné (n ≥ 1).
        </li>
        <li>
          <b>Singleton / bool</b> : <code>bool(a)</code> = <code>{`{a}`}</code> — ensemble composé d'un seul élément.
        </li>
      </ul>

      <h2>Structures dérivées</h2>
      <ul>
        <li>
          <b>Ensemble somme</b> : <code>red(S1)</code> — union des éléments de tous les ensembles de <code>S1</code>.
          Applicable uniquement aux ensembles composés d'ensembles.
        </li>
        <li>
          <b>Désingleton / debool</b> : <code>debool({`{a}`})</code> = <code>a</code> — extraction du seul élément
          d'un ensemble. Applicable uniquement aux ensembles à un seul élément.
        </li>
        <li>
          <b>Petite projection</b> : <code>pr1((a1, …, an))</code> = <code>a1</code>.
        </li>
        <li>
          <b>Grande projection</b> : <code>Pr1(S1)</code> — ensemble des premières composantes de tous les tuples de{' '}
          <code>S1</code>.
        </li>
      </ul>
      <p>
        Les indices des opérations sur les tuples sont affichés comme 1 par simplicité, mais peuvent être remplacés par
        d'autres nombres naturels ou une séquence séparée par des virgules.
      </p>

      <h2>Multi-indices</h2>
      <p>
        Au lieu d'un seul indice, un <b>multi-indice</b> peut être utilisé — une séquence de nombres naturels séparés
        par des virgules. Dans ce cas, la projection ou le filtre retourne plusieurs positions du tuple à la fois.
      </p>
      <ul>
        <li>
          <code>pr1,3((a1, a2, a3, a4)) = (a1, a3)</code>
        </li>
        <li>
          <code>Pr2,4(S1)</code> — ensemble de paires composées des deuxième et quatrième composantes des tuples de{' '}
          <code>S1</code>.
        </li>
      </ul>

      <h2>{tx('tx.rslang.token.filter')}</h2>
      <ul>
        <li>
          <b>Filtre</b> : <code>Fi1[D1](S1)</code> — sous-ensemble de <code>S1</code> dans lequel la première
          projection de chaque élément appartient à <code>D1</code>.
        </li>
        <li>
          Les <b>multi-indices</b> sont applicables aux filtres ; le nombre de paramètres entre crochets doit
          correspondre au nombre de positions d'index.
        </li>
        <li>
          L'utilisation d'un multi-indice avec un seul paramètre est autorisée. On vérifie alors l'appartenance au
          paramètre du tuple composé des projections correspondantes des éléments de l'ensemble filtré.
        </li>
        <li>
          <b>Multi-filtre</b> : <code>Fi1,2[D1](S1)</code> diffère du filtre à multi-indice{' '}
          <code>Fi1,2[Pr1(D1), Pr2(D2)](S1)</code> en ce que le premier vérifie l'appartenance aux paires de D1,
          tandis que le second vérifie par rapport au produit cartésien complet des projections de D1.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <ul>
        <li>
          <code>{`ℬ(2) = {{}, {1}, {2}, {1, 2}}`}</code>
        </li>
        <li>
          <code>(1,2,3)</code> — tuple de trois nombres
        </li>
        <li>
          <code>pr2((5, 4, 3, 2, 1)) = 4</code>
        </li>
        <li>
          <code>
            Pr3({`{(1, 2, 3),(4, 5, 6)}`}) = {`{3, 6}`}
          </code>
        </li>
        <li>
          <code>
            red({`{{1, 2, 3},{3, 4}}`}) = {`{1, 2, 3, 4}`}
          </code>
        </li>
        <li>
          <code>bool(1) = {`{1}`}</code>, <code>debool({`{1}`}) = 1</code>
        </li>
        <li>
          <code>{`Fi2[{2, 4}]({((1, 2), (3, 4), (5, 6))}) = {((1, 2), (3, 4))}`}</code>
        </li>
      </ul>
    </>
  );
}
