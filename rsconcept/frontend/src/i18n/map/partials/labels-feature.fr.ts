/** French overrides for feature UI bundles. */
export const labelsFeatureFr: Record<string, string> = {
  'labels.rsform.cstClassLabel.nominal': 'nominal',
  'labels.rsform.cstClassLabel.basic': 'de base',
  'labels.rsform.cstClassLabel.derived': 'dérivé',
  'labels.rsform.cstClassLabel.statement': 'énoncé',
  'labels.rsform.cstClassLabel.template': 'modèle',

  'labels.rsform.cstClassDesc.nominal': 'entité nominale',
  'labels.rsform.cstClassDesc.basic': 'notion non définie',
  'labels.rsform.cstClassDesc.derived': 'notion définie',
  'labels.rsform.cstClassDesc.statement': 'énoncé logique',
  'labels.rsform.cstClassDesc.template': 'modèle de définition',

  'labels.rsform.graphMode.explore': 'Mode : consultation',
  'labels.rsform.graphMode.edit': 'Mode : édition',

  'labels.rsform.coloring.none': 'Couleur : mono',
  'labels.rsform.coloring.status': 'Couleur : statut',
  'labels.rsform.coloring.type': 'Couleur : classe',
  'labels.rsform.coloring.schemas': 'Couleur : schémas',

  'labels.rsform.edgeType.full': 'Liens : tous',
  'labels.rsform.edgeType.definition': 'Liens : définition',
  'labels.rsform.edgeType.attribution': 'Liens : attribution',

  'labels.rsform.exprStatus.verified': 'valide',
  'labels.rsform.exprStatus.incorrect': 'erreur',
  'labels.rsform.exprStatus.incalculable': 'non calculable',
  'labels.rsform.exprStatus.property': 'non mesurable',
  'labels.rsform.exprStatus.unknown': 'non vérifié',

  'labels.rsform.exprStatusDesc.verified': 'valide et calculable',
  'labels.rsform.exprStatusDesc.incorrect': 'erreur détectée',
  'labels.rsform.exprStatusDesc.incalculable': 'l’interprétation ne s’évalue pas',
  'labels.rsform.exprStatusDesc.property': 'vérification d’appartenance seulement',
  'labels.rsform.exprStatusDesc.unknown': 'vérification requise',

  'labels.rsform.rsExpression.nominal': 'Constituantes définissantes',
  'labels.rsform.rsExpression.structure': 'Domaine de définition',
  'labels.rsform.rsExpression.function': 'Définition de fonction',

  'labels.oss.substitution.invalidIDs': 'Erreur d’identifiants de schémas',
  'labels.oss.substitution.incorrectCst': 'Erreur {from} → {to} : expression de constituante non valide',
  'labels.oss.substitution.invalidBasic':
    'Erreur {from} → {to} : remplacer une notion générique par un ensemble de base',
  'labels.oss.substitution.invalidConstant':
    'Erreur {from} → {to} : un ensemble constant ne peut remplacer qu’un autre ensemble constant',
  'labels.oss.substitution.invalidNominal': 'Erreur {from} → {to} : un nominal ne peut remplacer qu’un autre nominal',
  'labels.oss.substitution.invalidClasses': 'Erreur {from} → {to} : classes de constituantes différentes',
  'labels.oss.substitution.typificationCycle': 'Erreur : cycle de substitutions dans les typifications {detail}',
  'labels.oss.substitution.baseSubstitutionNotSet': 'Erreur : la typification ne fixe pas l’ensemble {from} ∈ {to}',
  'labels.oss.substitution.unequalTypification':
    'Erreur {from} → {to} : typifications des opérandes structurels différentes',
  'labels.oss.substitution.unequalArgsCount': 'Erreur {from} → {to} : nombre d’arguments différent',
  'labels.oss.substitution.unequalArgs': 'Erreur {from} → {to} : typifications des arguments différentes',
  'labels.oss.substitution.unequalExpressions': 'Avertissement {from} → {to} : définitions des notions différentes',

  'labels.rsmodel.valueDesc.cardinalityPrefix': 'Cardinalité : {n} | {stub}',

  'labels.ai.variable.block': 'Bloc courant du schéma opérationnel',
  'labels.ai.variable.oss': 'Schéma opérationnel courant',
  'labels.ai.variable.schema': 'Schéma conceptuel courant',
  'labels.ai.variable.schemaThesaurus': 'Termes et définitions du schéma conceptuel courant',
  'labels.ai.variable.schemaGraph': 'Graphe des liens de définition des constituantes',
  'labels.ai.variable.schemaTypeGraph': 'Graphe des paliers de types du schéma conceptuel',
  'labels.ai.variable.constituenta': 'Constituante courante',
  'labels.ai.variable.constituentaSyntaxTree': 'Arbre syntaxique de la constituante',
  'labels.ai.variableMock.block': 'Ex. : bloc courant du schéma opérationnel',
  'labels.ai.variableMock.oss': 'Ex. : schéma opérationnel courant',
  'labels.ai.variableMock.schema': 'Ex. : schéma conceptuel courant',
  'labels.ai.variableMock.schemaThesaurus': 'Ex.\nTerme1 — Définition1\nTerme2 — Définition2',
  'labels.ai.variableMock.schemaGraph': 'Ex. : graphe des liens de définition des constituantes',
  'labels.ai.variableMock.schemaTypeGraph': 'Ex. : graphe des paliers de types du schéma conceptuel',
  'labels.ai.variableMock.constituenta': 'Ex. : constituante courante',
  'labels.ai.variableMock.constituentaSyntaxTree': 'Ex. d’arbre syntaxique de constituante'
};
