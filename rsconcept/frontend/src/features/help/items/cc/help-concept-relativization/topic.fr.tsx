import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelativizationFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        La relativisation permet de décrire une famille de cas dans un seul schéma conceptuel. Par exemple, le schéma
        d’un graphe peut donner un schéma pour toute une famille de graphes. Chaque graphe peut avoir son propre
        ensemble d’arêtes, et les mêmes axiomes doivent être vérifiés dans tous les graphes.
      </p>
      <h2>Contextes et valeurs</h2>
      <p>
        Choisissez le <b>constituant à relativiser</b> pour définir ce qui constitue un cas, ou <b>contexte</b>. Si vous
        choisissez un ensemble de base <code>X#</code>, il reste l’ensemble commun des éléments, et chaque contexte est
        un de ses sous-ensembles. Si vous choisissez une structure générique <code>S#</code>, chaque contexte est une
        valeur entière de cette structure, par exemple toute la relation des arêtes d’un graphe.
      </p>
      <p>
        Le résultat comporte une structure générique appelée <b>axe des contextes</b>. Le Portail l’ajoute si vous avez
        choisi un ensemble de base, ou transforme la structure générique choisie en axe. En renseignant le modèle
        conceptuel, indiquez dans l’axe l’ensemble des contextes pour lesquels les valeurs seront calculées et les
        conditions vérifiées.
      </p>
      <p>
        Dans les formules qui en dépendent, le Portail remplace le constituant choisi par le contexte courant. Les
        autres concepts prennent les valeurs qui correspondent à ce même contexte.
      </p>
      <ul>
        <li>
          Pour les autres ensembles de base et ensembles constants, le Portail ajoute des relations qui permettent
          d’associer à chaque contexte son propre sous-ensemble de l’ensemble commun. Les autres structures génériques
          deviennent des relations formées de couples « contexte, valeur de la structure ». Les{' '}
          <b>constituants exclus</b> gardent une valeur commune à tous les contextes.
        </li>
        <li>
          Un terme qui dépend du contexte devient une <b>famille de valeurs</b>. La nouvelle formule évalue le terme
          d’origine pour chaque contexte et renvoie des couples « contexte, valeur du terme ». Si le terme renvoie un
          ensemble, celui-ci occupe en entier la seconde composante du couple.
        </li>
        <li>
          Les fonctions et les prédicats qui dépendent du contexte reçoivent le contexte en premier argument. Les
          axiomes et les énoncés qui en dépendent s’appliquent à tous les contextes par quantification universelle.
        </li>
      </ul>
      <p>
        Quand une formule utilise la valeur d’une famille ou d’une relation pour un seul contexte, le Portail ajoute une{' '}
        <b>fonction de dérélativisation</b>. Elle trouve l’unique couple du contexte demandé et renvoie sa seconde
        composante. L’ensemble vide est une valeur possible pour cette composante.
      </p>
      <h2>Une famille de graphes</h2>
      <p>
        Soit <code>X1</code> l’ensemble des sommets, <code>S1</code> l’ensemble des arêtes et{' '}
        <code>D1 := card(S1)</code> le nombre d’arêtes. L’axiome <code>D1 &gt; 0</code> exige au moins une arête.
        Choisissez <code>X1</code> comme constituant à relativiser. Un contexte est alors un ensemble de sommets, et
        vous pouvez préciser les arêtes séparément pour chaque ensemble.
      </p>
      <p>
        Prenons deux contextes. L’ensemble <code>{'{a, b}'}</code> a une arête <code>(a, b)</code>, et l’ensemble{' '}
        <code>{'{b, d}'}</code> n’en a aucune. La fonction de dérélativisation récupère les arêtes de chaque contexte et
        le terme renvoie la famille <code>{'{({a, b}, 1), ({b, d}, 0)}'}</code>. L’axiome obtenu est faux, car le second
        contexte a zéro arête.
      </p>
      <h2>Comment relativiser un schéma</h2>
      <ol>
        <li>
          Pour un résultat autonome, ouvrez « {tx('tx.general.editing')} » dans le{' '}
          <LinkTopic text='schéma source' topic={HelpTopic.UI_SCHEMA_MENU} />. Pour un résultat lié, ouvrez « Ajouter… »
          dans le <LinkTopic text='graphe du SOS' topic={HelpTopic.UI_OSS_GRAPH} />. Choisissez «{' '}
          {tx('tx.oss.relativization')} ».
        </li>
        <li>
          Dans un SOS, sélectionnez le schéma source. Choisissez le constituant à relativiser, le titre et l’abréviation
          du résultat. Si le nom de la famille est vide, le Portail utilise le nom par défaut dans la langue du schéma
          source. Pour garder des concepts communs aux contextes, sélectionnez-les dans «{' '}
          {tx('tx.oss.relativization.excluded')} ».
        </li>
        <li>
          Choisissez « {tx('tx.oss.relativization.quick.create')} » pour utiliser les textes proposés. Pour les modifier
          avant l’enregistrement, choisissez « {tx('tx.oss.relativization.review.start')} ». Examinez les propositions
          du noyau, apportez les précisions demandées et confirmez la création. Le Portail vérifie les formules dans les
          deux cas.
        </li>
      </ol>
      <h2>Résultats autonomes et liés</h2>
      <p>
        Un résultat autonome provient d’un instantané du schéma source. Dans un SOS, les modifications de la source
        mettent à jour le résultat, qui peut servir d’argument à une synthèse. Le Portail rejette toute modification de
        la source qui supprime le constituant choisi ou rend les expressions transformées non calculables.
      </p>
      <p>
        Voir le <LinkTopic text='glossaire' topic={HelpTopic.THESAURUS} /> et le{' '}
        <LinkTopic text='schéma opérationnel de synthèse' topic={HelpTopic.CC_OSS} />.
      </p>
    </>
  );
}
