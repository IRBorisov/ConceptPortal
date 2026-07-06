import { type TourStepContent } from '../../models/tour';

export const sandboxIntroContentFr: Record<string, TourStepContent> = {
  welcome: {
    title: 'Bienvenue dans le bac à sable',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le bac à sable est un environnement de démonstration qui fonctionne sans inscription. Il contient un petit
          schéma conceptuel avec un modèle, stockés localement dans votre navigateur.
        </p>
        <p>
          Ce court tour parcourt les onglets de l&apos;éditeur et montre comment un <b>schéma</b> définit les concepts
          et leurs relations, tandis qu&apos;un <b>modèle</b> fournit des valeurs concrètes et les résultats de
          l&apos;évaluation.
        </p>
      </div>
    )
  },
  passport: {
    title: 'Passeport',
    body: (
      <p>
        Le passeport désigne votre schéma et votre modèle : titre, alias et description. Chaque élément de la
        bibliothèque du Portail en possède un. Nous allons ensuite examiner les concepts eux-mêmes.
      </p>
    )
  },
  list: {
    title: 'Liste des constituantes',
    body: (
      <p>
        Les constituantes sont les éléments de base d&apos;un schéma : ensembles de base, termes, définitions et
        axiomes. La liste affiche leurs alias, termes et définitions formelles dans un seul tableau.
      </p>
    )
  },
  concept: {
    title: 'Éditeur de constituante',
    body: (
      <p>
        Ici, une constituante est modifiée : son terme, sa définition textuelle et sa définition formelle.
        Sélectionnez des constituantes dans la liste pour les ouvrir dans cet onglet. Dans le bac à sable, vous pouvez
        expérimenter librement — les données restent locales.
      </p>
    )
  },
  graph: {
    title: 'Graphe des termes',
    body: (
      <p>
        Le graphe visualise les relations entre concepts : quelles définitions dépendent de quelles autres. Il aide à
        voir la structure du schéma dans son ensemble.
      </p>
    )
  },
  data: {
    title: 'Données du modèle',
    body: (
      <p>
        C&apos;est ici que le schéma rencontre le modèle : les ensembles de base reçoivent des éléments concrets. Le
        schéma définit la structure, et le modèle la remplit avec des valeurs issues d&apos;un domaine sujet.
      </p>
    )
  },
  evaluation: {
    title: 'Évaluation',
    body: (
      <p>
        Les définitions sont calculées à partir des données du modèle. Ici, vous pouvez inspecter les valeurs calculées
        et les problèmes — par exemple, les expressions qui ne peuvent pas être évaluées avec les données actuelles.
      </p>
    )
  },
  finish: {
    title: 'Vous êtes prêt',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Voici le cycle principal : définir les concepts dans le schéma, fournir les données dans le modèle et examiner
          les résultats de l&apos;évaluation.
        </p>
        <p>
          Explorez librement le bac à sable — vous pouvez toujours restaurer les données initiales depuis le menu ou
          consulter les manuels.
        </p>
      </div>
    )
  }
};
