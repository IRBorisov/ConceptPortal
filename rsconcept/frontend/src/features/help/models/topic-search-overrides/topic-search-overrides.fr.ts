import { HelpTopic, type HelpTopic as HelpTopicValue } from '../help-topic';

import type { HelpSearchOverride } from './types';

export const topicSearchOverridesFr: Record<HelpTopicValue, HelpSearchOverride> = {
  [HelpTopic.MAIN]: {
    keywords: ['portail', 'aide', 'manuel', 'sections', 'support', 'documentation'],
    searchText:
      'Aide générale sur le Portail. Sections d’aide, schémas conceptuels, modèles, opérations de synthèse, support, licences et politique de traitement des données.'
  },
  [HelpTopic.THESAURUS]: {
    keywords: ['thésaurus', 'termes', 'concepts', 'dictionnaire', 'définitions', 'constituant'],
    searchText:
      'Thésaurus du Portail. Termes clés, concepts, définitions, schéma conceptuel, constituant, attributs, modèle et opérations.'
  },
  [HelpTopic.INTERFACE]: {
    keywords: ['interface', 'navigation', 'thème', 'icônes', 'infobulles', 'vidéo', 'menu'],
    searchText:
      'Interface utilisateur du Portail. Navigation, réglages, thème clair et sombre, aide contextuelle, icônes, vidéo et menu utilisateur.'
  },
  [HelpTopic.UI_LIBRARY]: {
    keywords: [
      'bibliothèque',
      'schémas',
      'recherche',
      'recherche contextuelle',
      'métadonnées',
      'termes',
      'définitions',
      'filtre',
      'dossiers',
      'explorateur',
      'tri'
    ],
    searchText:
      'Bibliothèque de schémas. Recherche par métadonnées et recherche contextuelle dans les termes, définitions et commentaires, filtres, tri, explorateur de dossiers, consultation des schémas conceptuels, OSS et modèles.'
  },
  [HelpTopic.UI_SCHEMA_MENU]: {
    keywords: ['menu schéma', 'édition schéma', 'onglets', 'actions', 'commandes'],
    searchText:
      'Édition de schéma. Onglets, menu du schéma, actions sur le schéma, changement de mode et commandes d’édition.'
  },
  [HelpTopic.UI_MODEL_MENU]: {
    keywords: ['menu modèle', 'édition modèle', 'onglets modèle', 'actions modèle', 'commandes modèle'],
    searchText:
      'Édition de modèle. Onglets du modèle, menu du modèle, recalcul, clonage, ouverture du schéma et transfert du modèle vers le bac à sable.'
  },
  [HelpTopic.UI_SCHEMA_CARD]: {
    keywords: [
      'passeport schéma conceptuel',
      'passeport schéma',
      'fiche schéma',
      'attributs schéma',
      'métadonnées',
      'propriétés'
    ],
    searchText:
      'Passeport du schéma conceptuel. Attributs principaux, gestion, propriétés, description, statistiques et autres métadonnées.'
  },
  [HelpTopic.UI_SCHEMA_LIST]: {
    keywords: ['liste constituants', 'tableau', 'constituants', 'liste schéma', 'lignes', 'glisser', 'ordre'],
    searchText:
      'Liste des constituants du schéma. Vue tabulaire, sélection Ctrl/Cmd, réordonnancement par glisser-déposer, sélection de lignes, navigation parmi les constituants.'
  },
  [HelpTopic.UI_SCHEMA_EDITOR]: {
    keywords: ['éditeur constituant', 'éditeur', 'constituant', 'attributs', 'liste constituants', 'panneau latéral'],
    searchText:
      'Éditeur de constituant. Modification des attributs, liste latérale avec glisser-déposer, commandes de gestion, édition des concepts et propriétés.'
  },
  [HelpTopic.UI_MODEL_CARD]: {
    keywords: ['passeport modèle', 'fiche modèle', 'attributs modèle', 'modèle'],
    searchText: 'Passeport du modèle. Propriétés et attributs principaux, lien avec le schéma, gestion du modèle.'
  },
  [HelpTopic.UI_MODEL_LIST]: {
    keywords: ['liste modèle', 'constituants modèle', 'tableau modèle', 'éléments modèle'],
    searchText:
      'Liste des constituants du modèle. Travail tabulaire sur la composition du modèle, gestion des lignes, consultation des données du modèle.'
  },
  [HelpTopic.UI_MODEL_VALUE]: {
    keywords: ['données modèle', 'valeurs', 'saisie', 'édition valeurs', 'tableau valeurs'],
    searchText:
      'Données du modèle. Saisie, consultation et édition des valeurs, travail sur les données du modèle, tableau des valeurs et calculs.'
  },
  [HelpTopic.UI_MODEL_VALUE_EDIT]: {
    keywords: ['dialogue valeur', 'valeur', 'éditeur valeur', 'vue valeur', 'structure valeur'],
    searchText:
      'Dialogue de valeur. Vue et édition structurées d’une valeur isolée, travail détaillé sur un élément de données.'
  },
  [HelpTopic.UI_MODEL_EVALUATOR]: {
    keywords: ['calcul expression', 'évaluation', 'calculatrice', 'vérification expression', 'estimation'],
    searchText:
      'Calcul d’expressions. Vérification et évaluation d’expressions arbitraires, lancement du calcul, consultation des résultats et statuts.'
  },
  [HelpTopic.UI_EVAL_STATUS]: {
    keywords: ['statuts calcul', 'statut', 'erreurs', 'calcul', 'notation'],
    searchText: 'Statuts de calcul. Notation des états de calcul, erreurs, exécutions et statuts de service.'
  },
  [HelpTopic.UI_MODEL_BINDING]: {
    keywords: [
      'interprétation de base',
      'éditeur interprétation de base',
      'ensemble de base',
      'modèle',
      'recherche texte'
    ],
    searchText:
      'Éditeur d’interprétation de base. Table de valeurs pour les concepts primitifs, recherche textuelle sur les éléments, ajout et suppression de lignes du modèle.'
  },
  [HelpTopic.UI_GRAPH_TERM]: {
    keywords: ['graphe des termes', 'graphe', 'termes', 'nœuds', 'liens', 'disposition'],
    searchText:
      'Graphe des termes. Configuration du graphe, modification des nœuds et des liens, navigation et analyse visuelle de la structure.'
  },
  [HelpTopic.UI_FORMULA_TREE]: {
    keywords: ['arbre syntaxique', 'formule', 'arbre d’expression', 'nœuds expression', 'ast'],
    searchText:
      'Arbre d’analyse d’expression. Types de nœuds, structure de l’expression, arbre syntaxique, consultation des formules et constructions imbriquées.'
  },
  [HelpTopic.UI_TYPE_GRAPH]: {
    keywords: ['graphe des niveaux', 'graphe des types', 'niveaux', 'types', 'couleurs nœuds'],
    searchText:
      'Graphe des niveaux. Couleurs des nœuds, commandes du graphe, consultation des niveaux et des relations entre types.'
  },
  [HelpTopic.UI_CST_STATUS]: {
    keywords: ['statut constituant', 'statut', 'notation', 'constituant'],
    searchText: 'Statut du constituant. Notation des statuts, sens des marqueurs et interprétation des états.'
  },
  [HelpTopic.UI_CST_CLASS]: {
    keywords: ['classe constituant', 'classe', 'notation', 'marqueurs', 'constituant'],
    searchText: 'Classe de constituant. Notation des classes, marqueurs et différences entre types de constituants.'
  },
  [HelpTopic.UI_OSS_GRAPH]: {
    keywords: ['schéma opérationnel', 'oss', 'graphe oss', 'opérations', 'nœuds', 'configuration graphe'],
    searchText:
      'Schéma opérationnel de synthèse (OSS). Vue graphique de l’OSS, configuration du graphe, modification des nœuds, commandes communes et consultation des opérations.'
  },
  [HelpTopic.UI_OSS_SIDEBAR]: {
    keywords: ['panneau latéral', 'panneau', 'opération', 'contenu opération', 'édition'],
    searchText:
      'Panneau latéral du schéma opérationnel. Édition du contenu de l’opération sélectionnée, consultation des paramètres et des détails.'
  },
  [HelpTopic.UI_OSS_CARD]: {
    keywords: [
      'passeport oss',
      'fiche oss',
      'schéma opérationnel',
      'attributs oss',
      'métadonnées',
      'statistiques opérations'
    ],
    searchText:
      'Passeport OSS. Nom, abréviation, description, accès et emplacement en bibliothèque, statistiques d’opérations par type et schémas attachés.'
  },
  [HelpTopic.UI_SUBSTITUTIONS]: {
    keywords: ['identifications', 'table identifications', 'substitutions', 'appariements', 'constituants'],
    searchText:
      'Table d’identifications. Appariement et identification des constituants, gestion des substitutions et des liens.'
  },
  [HelpTopic.UI_RELOCATE_CST]: {
    keywords: ['déplacer constituants', 'réordonnancement', 'haut', 'bas', 'oss', 'constituants'],
    searchText:
      'Déplacement des constituants dans un schéma opérationnel. Monter et descendre, modifier l’ordre des constituants et la structure de l’opération.'
  },
  [HelpTopic.UI_STRUCTURE_PLANNER]: {
    keywords: [
      'planificateur structure',
      'structure du terme',
      'typification',
      'graphe structure',
      'constituant',
      'terme',
      'tuple',
      'réduction'
    ],
    searchText:
      'Planificateur de structure de terme. Graphe des positions dans la typification du constituant sélectionné, fragment de définition formelle, création et édition des termes aux positions de structure.'
  },
  [HelpTopic.CONCEPTUAL]: {
    keywords: ['conceptualisation', 'théorie', 'concepts', 'domaine', 'schéma'],
    searchText:
      'Conceptualisation. Fondements du Portail, concepts du domaine, schémas, modèles et opérations de synthèse.'
  },
  [HelpTopic.CC_SYSTEM]: {
    keywords: ['schéma conceptuel', 'système de définitions', 'définitions', 'concepts', 'sc'],
    searchText:
      'Schéma conceptuel comme système de définitions. Concepts, définitions, structure formelle du schéma et organisation du domaine.'
  },
  [HelpTopic.CC_RSMODEL]: {
    keywords: ['modèle conceptuel', 'modèle', 'interprétation', 'données', 'instances'],
    searchText:
      'Modèle conceptuel. Système de définitions interprété, données du domaine, valeurs et lien entre modèle et schéma.'
  },
  [HelpTopic.CC_CONSTITUENTA]: {
    keywords: ['attributs constituant', 'constituant', 'attributs', 'primitif', 'dérivé'],
    searchText:
      'Attributs du constituant. Concepts primitifs et dérivés, propriétés du constituant, description et classification des attributs.'
  },
  [HelpTopic.CC_RELATIONS]: {
    keywords: ['liens', 'relations', 'constituants', 'dépendances', 'liens entre constituants'],
    searchText:
      'Liens entre constituants. Relations, dépendances, liens structurels et description des interactions entre concepts.'
  },
  [HelpTopic.CC_SYNTHESIS]: {
    keywords: ['synthèse', 'fusion schémas', 'union schémas', 'composition', 'schémas conceptuels'],
    searchText:
      'Synthèse de schémas conceptuels. Fusion de schémas, composition des définitions et constitution de systèmes de concepts plus larges.'
  },
  [HelpTopic.CC_STRUCTURING]: {
    keywords: ['structuration', 'domaine', 'décomposition', 'organisation concepts'],
    searchText:
      'Structuration du domaine. Découpage et organisation des concepts, identification d’entités, construction d’une structure formelle.'
  },
  [HelpTopic.CC_OSS]: {
    keywords: ['schéma opérationnel synthèse', 'oss', 'opérations', 'scénario synthèse', 'workflow'],
    searchText:
      'Schéma opérationnel de synthèse. Description du processus de synthèse, opérations, entrées et sorties, enchaînement des étapes et logique d’exécution.'
  },
  [HelpTopic.CC_PROPAGATION]: {
    keywords: ['changements bout en bout', 'propagation changements', 'changements', 'propagation', 'oss'],
    searchText:
      'Changements bout en bout dans un schéma opérationnel. Propagation entre entités liées, cohérence des données et des dépendances.'
  },
  [HelpTopic.RSLANG]: {
    keywords: ['explication structures de genres', 'langage', 'expressions', 'syntaxe', 'sémantique', 'rslang'],
    searchText:
      'Explication à structure générique. Langage d’expressions du Portail, syntaxe, sémantique, typage, interprétation et modèles.'
  },
  [HelpTopic.RSL_LITERALS]: {
    keywords: ['identifiants', 'littéraux', 'noms', 'nombres', 'chaînes', 'règles de nommage'],
    searchText:
      'Identifiants et littéraux. Règles d’écriture des identifiants, littéraux, nommage des entités et éléments de base du langage.'
  },
  [HelpTopic.RSL_TYPIFICATION]: {
    keywords: ['typage', 'types', 'genres', 'niveaux', 'système de types'],
    searchText:
      'Typage. Système de types dans l’explication à structure générique, niveaux, règles de compatibilité et description des types.'
  },
  [HelpTopic.RSL_EXPRESSION_LOGIC]: {
    keywords: ['expressions logiques', 'prédicats', 'logique', 'vérité', 'conditions', 'booléen'],
    searchText:
      'Expressions logiques. Prédicats, connecteurs logiques, conditions, comparaisons, vérité et vérification des constructions logiques.'
  },
  [HelpTopic.RSL_EXPRESSION_SET]: {
    keywords: ['expressions ensemblistes', 'ensembles', 'union', 'intersection', 'appartenance'],
    searchText:
      'Expressions ensemblistes. Opérations de base sur les ensembles, appartenance, union, intersection et exemples.'
  },
  [HelpTopic.RSL_EXPRESSION_STRUCTURE]: {
    keywords: ['expressions structurelles', 'structures', 'tuples', 'champs', 'construction structures'],
    searchText:
      'Expressions structurelles. Construction de structures, accès aux éléments, structures dérivées et composition d’objets.'
  },
  [HelpTopic.RSL_EXPRESSION_ARITHMETIC]: {
    keywords: ['expressions arithmétiques', 'arithmétique', 'nombres', 'comparaison', 'opérations'],
    searchText:
      'Expressions arithmétiques. Opérations arithmétiques de base, comparaisons, calculs et expressions numériques.'
  },
  [HelpTopic.RSL_EXPRESSION_QUANTOR]: {
    keywords: ['expressions quantifiées', 'quantificateurs', 'pour tout', 'il existe', 'variables'],
    searchText:
      'Expressions quantifiées. Syntaxe et sémantique des quantificateurs, constructions pour tout et il existe, portée des variables.'
  },
  [HelpTopic.RSL_EXPRESSION_DECLARATIVE]: {
    keywords: ['expressions déclaratives', 'déclaratif', 'description', 'déclaration'],
    searchText:
      'Expressions déclaratives. Syntaxe, sémantique et modes de description déclarative des objets et propriétés.'
  },
  [HelpTopic.RSL_EXPRESSION_IMPERATIVE]: {
    keywords: ['expressions impératives', 'actions', 'blocs d’actions', 'commandes', 'séquence'],
    searchText: 'Expressions impératives. Syntaxe, blocs d’actions, séquence d’opérations et contrôle d’exécution.'
  },
  [HelpTopic.RSL_EXPRESSION_RECURSIVE]: {
    keywords: ['constructions itératives', 'récursion', 'boucle', 'itération', 'répétition'],
    searchText:
      'Constructions itératives. Syntaxe des boucles et expressions récursives, composition des constructions, répétition et évaluation.'
  },
  [HelpTopic.RSL_EXPRESSION_PARAMETER]: {
    keywords: [
      'expressions paramétrées',
      'paramètres',
      'fonction terme',
      'fonction prédicat',
      'arguments',
      'modèle',
      'radical',
      'vérification typification'
    ],
    searchText:
      'Expressions paramétrées. Déclaration de fonctions terme et prédicat, paramètres, arguments, typification des radicaux modèles et réutilisation.'
  },
  [HelpTopic.RSL_CORRECT]: {
    keywords: ['portabilité', 'correction', 'validité', 'compatibilité', 'vérification'],
    searchText:
      'Portabilité et correction. Exigences de correction des expressions, compatibilité des définitions et limites du langage.'
  },
  [HelpTopic.RSL_INTERPRET]: {
    keywords: ['interprétabilité', 'interprétation', 'sens expression', 'sémantique'],
    searchText:
      'Interprétabilité. Interprétation des définitions et énoncés, sémantique des expressions et lien avec le domaine.'
  },
  [HelpTopic.RSL_OPERATIONS]: {
    keywords: ['opérations sur schémas', 'opérations', 'schémas', 'transformations', 'actions schémas'],
    searchText:
      'Opérations sur les schémas conceptuels. Opérations formelles, transformations de schémas, application de règles et modification de structure.'
  },
  [HelpTopic.RSL_TEMPLATES]: {
    keywords: ['modèles', 'banque d’expressions', 'fragments', 'réutilisation', 'patrons'],
    searchText: 'Modèles. Banque d’expressions, fragments, réutilisation d’expressions et constructions typiques.'
  },
  [HelpTopic.TERM_CONTROL]: {
    keywords: ['terminologie', 'termes', 'contrôle terminologique', 'renvois', 'renvois textuels'],
    searchText:
      'Contrôle terminologique. Gestion des termes et renvois textuels, cohérence terminologique et lien texte–schémas.'
  },
  [HelpTopic.ACCESS]: {
    keywords: ['accès', 'droits', 'rôles', 'propriétaire', 'éditeur', 'permissions'],
    searchText:
      'Gestion des accès. Droits utilisateurs, rôles propriétaire et éditeur, configuration des permissions et travail collaboratif.'
  },
  [HelpTopic.VERSIONS]: {
    keywords: ['versions', 'versionnement', 'historique', 'restauration', 'changements', 'révisions'],
    searchText:
      'Versionnement des schémas. Historique des changements, actions sur les versions, restauration et gestion des révisions.'
  },
  [HelpTopic.ASSISTANT]: {
    keywords: [
      'assistant ia',
      'assistant',
      'intelligence artificielle',
      'prompt',
      'requêtes',
      'suggestions',
      'rstool',
      'mcp',
      'agent ia',
      'agent'
    ],
    searchText:
      'Assistant IA. Travail avec l’assistant intelligent, requêtes, génération de suggestions, rstool et MCP pour agents IA externes.'
  },
  [HelpTopic.INFO]: {
    keywords: ['documentation', 'informations', 'documents', 'règles', 'api', 'politique'],
    searchText:
      'Informations de référence et documents. Règles de conduite, remerciements, politique de traitement des données, API REST et documentation technique.'
  },
  [HelpTopic.INFO_RULES]: {
    keywords: ['règles', 'comportement', 'participants', 'code', 'normes', 'interdits'],
    searchText:
      'Règles de comportement des participants au Portail. Comportement attendu, comportements inacceptables, normes d’interaction et responsabilité.'
  },
  [HelpTopic.CONTRIBUTORS]: {
    keywords: ['remerciements', 'développeurs', 'chercheurs', 'auteurs', 'contributions'],
    searchText:
      'Remerciements aux développeurs et chercheurs. Participants au projet, contributions au Portail et reconnaissance des auteurs.'
  },
  [HelpTopic.INFO_PRIVACY]: {
    keywords: ['politique données', 'données personnelles', 'confidentialité', 'privacy', 'données'],
    searchText:
      'Politique de traitement des données personnelles. Confidentialité, traitement des données, droits des utilisateurs et règles de conservation.'
  },
  [HelpTopic.INFO_API]: {
    keywords: ['interface programmatique', 'api', 'rest api', 'développeur', 'intégration', 'points de terminaison'],
    searchText:
      'Interface programmatique du Portail. API REST, intégrations, usage développeur, points de terminaison et intégration technique.'
  },
  [HelpTopic.EXTEOR]: {
    keywords: ['exteor', 'windows', 'programme', 'explication', 'application bureau'],
    searchText:
      'Exteor pour Windows. Fonctions principales du programme, travail sur l’explication des théories et usage de l’application de bureau.'
  }
};
