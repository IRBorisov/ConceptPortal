import { HelpTopic } from '@/features/help';

import {
  IconGenerateStructure,
  IconSearch,
  IconStatusOK,
  IconStatusUnknown,
  IconTree,
  IconTypeGraph
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';

import { TourHelpLink } from './tour-help-links';

export const sandboxIntroContentFr: Record<string, TourStepContent> = {
  'welcome': {
    title: 'Bienvenue dans le bac à sable',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le bac à sable est un environnement de démonstration qui fonctionne sans inscription. Il contient un petit
          schéma conceptuel avec un modèle, stockés localement dans votre navigateur.
        </p>
        <p>
          Ce tour parcourt l&apos;éditeur : gestion des constituantes, édition et vérification des définitions formelles
          avec diagnostic des erreurs, puis inspection des données du modèle et des résultats d&apos;évaluation.
        </p>
      </div>
    )
  },
  'passport': {
    title: 'Passeport',
    body: (
      <p>
        Le <TourHelpLink text='passeport' topic={HelpTopic.UI_SCHEMA_CARD} /> désigne votre schéma et votre modèle :
        titre, alias et description. Chaque élément de la bibliothèque du Portail en possède un. Nous allons ensuite
        examiner les constituantes.
      </p>
    )
  },
  'list': {
    title: 'Liste des constituantes',
    body: (
      <p>
        Les constituantes sont les éléments de base d&apos;un schéma : ensembles de base, termes, définitions et
        axiomes. L&apos;onglet <TourHelpLink text='liste' topic={HelpTopic.UI_MODEL_LIST} /> les regroupe dans un seul
        tableau — avec le statut d&apos;évaluation lorsqu&apos;un modèle est attaché.
      </p>
    )
  },
  'list-filter': {
    title: 'Recherche',
    body: (
      <p>
        Le champ <IconSearch className='inline-icon' /> de recherche trouve les constituantes par alias, terme ou texte
        de définition. Voir le manuel de la{' '}
        <TourHelpLink text='liste des constituantes' topic={HelpTopic.UI_SCHEMA_LIST} />.
      </p>
    )
  },
  'list-interact': {
    title: 'Sélection et ordre',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Cliquez sur une ligne pour sélectionner une constituante ; le compteur à gauche indique combien sont
          sélectionnées. Un double-clic ou un clic avec <kbd>Alt</kbd> ouvre la constituante dans l&apos;
          <TourHelpLink text='éditeur' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
        </p>
        <p>
          Faites glisser les lignes pour modifier l&apos;ordre dans le schéma. Le réordonnancement est désactivé tant
          qu&apos;une recherche est active — effacez le champ de recherche d&apos;abord si vous devez déplacer des
          éléments.
        </p>
      </div>
    )
  },
  'concept': {
    title: 'Éditeur de constituante',
    body: (
      <p>
        Ici, une constituante est modifiée dans l&apos;
        <TourHelpLink text='éditeur de constituante' topic={HelpTopic.UI_SCHEMA_EDITOR} /> : son terme, sa définition
        textuelle et sa définition formelle. Sélectionnez des constituantes dans la liste pour les ouvrir dans cet
        onglet. Dans le bac à sable, vous pouvez expérimenter librement — les données restent locales.
      </p>
    )
  },
  'concept-check': {
    title: 'Vérification et diagnostic',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Après avoir modifié une définition formelle, l&apos;indicateur <IconStatusUnknown className='inline-icon' />{' '}
          de <TourHelpLink text='statut de définition' topic={HelpTopic.UI_CST_STATUS} /> devient bleu jusqu&apos;à ce
          que vous lanciez une vérification. Cliquez dessus ou appuyez sur <kbd>Ctrl + Q</kbd> pour valider
          l&apos;expression.
        </p>
        <p>
          En cas d&apos;erreur, une liste apparaît sous l&apos;éditeur — cliquez sur un message pour aller au fragment
          problématique. Un statut <IconStatusOK className='inline-icon' /> vert signifie que la définition est
          vérifiée.
        </p>
      </div>
    )
  },
  'concept-tools': {
    title: 'Arbre de syntaxe et graphe des échelons',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le bouton <IconTree className='inline-icon' />{' '}
          <TourHelpLink text='arbre de syntaxe' topic={HelpTopic.UI_FORMULA_TREE} /> ouvre une boîte de dialogue avec
          l&apos;arbre d&apos;analyse de la définition formelle — utile pour comprendre la structure et repérer les
          erreurs d&apos;analyse.
        </p>
        <p>
          Le bouton <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='graphe des échelons' topic={HelpTopic.UI_TYPE_GRAPH} /> montre comment les types de
          l&apos;expression se relient sous forme de graphe de typification.
        </p>
      </div>
    )
  },
  'concept-structure': {
    title: 'Planificateur de structure',
    body: (
      <p>
        Pour les concepts structurés, <IconGenerateStructure size='1.25rem' className='inline-icon' /> Développer la
        structure ouvre le <TourHelpLink text='planificateur de structure' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> :
        un graphe interactif pour décomposer un concept en constituantes dérivées. Vous pouvez ajouter, modifier et
        relier des éléments directement depuis le diagramme.
      </p>
    )
  },
  'graph': {
    title: 'Graphe des termes',
    body: (
      <p>
        Le <TourHelpLink text='graphe des termes' topic={HelpTopic.UI_GRAPH_TERM} /> visualise les relations entre
        concepts : quelles définitions dépendent de quelles autres. Il aide à voir la structure du schéma dans son
        ensemble.
      </p>
    )
  },
  'data': {
    title: 'Données du modèle',
    body: (
      <p>
        Sur l&apos;onglet <TourHelpLink text='données du modèle' topic={HelpTopic.UI_MODEL_VALUE} />, le schéma
        rencontre le modèle : les ensembles de base reçoivent des éléments concrets. Le schéma définit la structure, et
        le modèle la remplit avec des valeurs issues d&apos;un domaine sujet.
      </p>
    )
  },
  'evaluation': {
    title: 'Évaluation',
    body: (
      <p>
        Sur l&apos;onglet <TourHelpLink text='évaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} />, les définitions sont
        calculées à partir des données du modèle. Ici, vous pouvez inspecter les valeurs calculées et les problèmes —
        par exemple, les expressions qui ne peuvent pas être évaluées avec les données actuelles.
      </p>
    )
  },
  'finish': {
    title: 'Vous êtes prêt',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Voici le cycle principal : gérer les constituantes, éditer et vérifier les définitions, fournir les données du
          modèle et examiner les résultats de l&apos;évaluation.
        </p>
        <p>
          Explorez librement le bac à sable — vous pouvez toujours restaurer les données initiales depuis le menu ou
          consulter les <TourHelpLink text='manuels' topic={HelpTopic.INTERFACE} />.
        </p>
      </div>
    )
  }
};
