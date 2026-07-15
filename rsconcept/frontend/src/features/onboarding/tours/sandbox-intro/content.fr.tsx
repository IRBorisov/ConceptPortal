import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const sandboxIntroContentFr: Record<string, TourStepContent> = {
  welcome: {
    title: 'Bienvenue dans le Bac à sable',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le Bac à sable est un environnement de démonstration sans inscription. Il contient un petit schéma conceptuel
          et un modèle, stockés localement dans le navigateur.
        </p>
        <p>
          Court aperçu des onglets de l&apos;éditeur. Sur une étape avec Détails, vous pouvez ouvrir le guide de
          l&apos;onglet mis en évidence.
        </p>
      </div>
    )
  },
  passport: {
    title: 'Passeport',
    body: (
      <p>
        Le <TourHelpLink text='passeport' topic={HelpTopic.UI_SCHEMA_CARD} /> définit le titre, le nom court et la
        description de ce schéma et modèle de démo. Détails — formulaire et panneau de statistiques.
      </p>
    )
  },
  list: {
    title: 'Liste des constituantes',
    body: (
      <p>
        La <TourHelpLink text='liste' topic={HelpTopic.UI_MODEL_LIST} /> montre les constituantes du schéma en tableau :
        concepts non définis, termes, fonctions, axiomes, énoncés, etc. Si un modèle est ouvert — aussi le statut
        d&apos;évaluation. Détails — recherche, sélection et ordre.
      </p>
    )
  },
  concept: {
    title: 'Éditeur de constituante',
    body: (
      <p>
        Ici vous éditez une constituante dans l&apos;
        <TourHelpLink text='éditeur de constituante' topic={HelpTopic.UI_SCHEMA_EDITOR} />: terme, convention ou
        définition textuelle, et définition formelle. Détails — vérification, outils syntaxiques et développement de
        structure.
      </p>
    )
  },
  graph: {
    title: 'Graphe des termes',
    body: (
      <p>
        Le <TourHelpLink text='graphe des termes' topic={HelpTopic.UI_GRAPH_TERM} /> montre les liens entre
        constituantes par définition et attribution. Détails — affichage, modes et navigation du canevas.
      </p>
    )
  },
  data: {
    title: 'Données du modèle',
    body: (
      <p>
        Dans l&apos;onglet <TourHelpLink text='données du modèle' topic={HelpTopic.UI_MODEL_VALUE} /> vous saisissez et
        consultez les valeurs des constituantes : interprétation du domaine pour les concepts non définis, résultat du
        calcul pour les dérivées. Détails — calcul, enregistrement et liaison.
      </p>
    )
  },
  evaluation: {
    title: 'Évaluation',
    body: (
      <p>
        L&apos;onglet <TourHelpLink text='Évaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> vérifie des expressions
        RSLang arbitraires sur les données du modèle, sans modifier les constituantes. Détails — champ d&apos;expression
        et visionneuse de résultat.
      </p>
    )
  },
  finish: {
    title: 'Vous êtes prêt',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Boucle principale : gérer et éditer les constituantes, fournir les données du modèle et évaluer des
          expressions. Les données initiales se restaurent depuis le menu du Bac à sable.
        </p>
        <p>
          Rouvrez cet aperçu depuis le menu du Bac à sable ; le guide d&apos;un onglet — via le badge d&apos;aide
          (Guide) sur cet onglet. Voir aussi les <TourHelpLink text='manuels' topic={HelpTopic.INTERFACE} />.
        </p>
      </div>
    )
  }
};
