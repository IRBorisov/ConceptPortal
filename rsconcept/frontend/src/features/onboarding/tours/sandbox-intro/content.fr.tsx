import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const sandboxIntroContentFr: Record<string, TourStepContent> = {
  welcome: {
    title: 'Bienvenue dans le Bac à sable',
    body: (
      <>
        <p>
          Le Bac à sable est un environnement de démonstration sans inscription. Il contient un petit schéma conceptuel
          et un modèle, stockés localement dans le navigateur.
        </p>
        <p>
          Court aperçu des onglets de l&apos;éditeur. Sur une étape avec Détails, vous pouvez ouvrir le guide de
          l&apos;onglet mis en évidence.
        </p>
      </>
    )
  },
  passport: {
    title: 'Passeport',
    body: (
      <p>
        Le <TourHelpLink text='passeport' topic={HelpTopic.UI_SCHEMA_CARD} /> définit le titre, le nom court et la
        description de ce schéma et modèle de démonstration. Détails — formulaire et panneau de statistiques.
      </p>
    )
  },
  list: {
    title: 'Liste des constituantes',
    body: (
      <p>
        La <TourHelpLink text='liste' topic={HelpTopic.UI_MODEL_LIST} /> montre les constituantes du schéma en tableau :
        concepts non définis, termes, fonctions, axiomes, énoncés, etc. Si un modèle est ouvert — aussi le statut
        d&apos;évaluation.
      </p>
    )
  },
  concept: {
    title: 'Concept',
    body: (
      <p>
        Dans l&apos;onglet <TourHelpLink text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> vous éditez une
        constituante : terme, convention ou définition textuelle, et définition formelle.
      </p>
    )
  },
  graph: {
    title: 'Graphe',
    body: (
      <p>
        L&apos;onglet <TourHelpLink text='Graphe' topic={HelpTopic.UI_GRAPH_TERM} /> montre les liens entre constituantes
        par définition et attribution.
      </p>
    )
  },
  data: {
    title: 'Données',
    body: (
      <p>
        Dans l&apos;onglet <TourHelpLink text='Données' topic={HelpTopic.UI_MODEL_VALUE} /> vous saisissez et consultez
        les valeurs des constituantes : interprétation du domaine pour les concepts non définis, résultat du calcul pour
        les dérivées.
      </p>
    )
  },
  evaluation: {
    title: 'Évaluation',
    body: (
      <p>
        L&apos;onglet <TourHelpLink text='Évaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> vérifie des expressions
        RSLang arbitraires sur les données du modèle, sans modifier les constituantes.
      </p>
    )
  },
  finish: {
    title: 'Vous pouvez commencer',
    body: (
      <>
        <p>
          Boucle principale : gérer et éditer les constituantes, fournir les données et évaluer des expressions. Données
          de départ — Réinitialiser tout dans le menu (☰).
        </p>
        <p>
          Relancer le tutoriel — Afficher le tutoriel dans le même menu ; guide d&apos;onglet — Guide rapide dans le menu
          du badge de tutoriel sur cet onglet. Voir aussi les{' '}
          <TourHelpLink text='manuels' topic={HelpTopic.INTERFACE} />.
        </p>
      </>
    )
  }
};
