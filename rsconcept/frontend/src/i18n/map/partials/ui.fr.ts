/** French UI copy for dialogs and toolbars. */
export const uiFr: Record<string, string> = {
  'ui.library.editor.openInLibrary': 'Ouvrir dans la bibliothèque',
  'ui.library.editor.pathInheritedOss': 'Chemin hérité de l’OSS',
  'ui.library.editor.ownerInheritedOss': 'Propriétaire hérité de l’OSS',
  'ui.library.pickLocation.explorerTitle': 'Explorateur…',

  'ui.ai.prompt.editTemplateTitle': 'Modifier le modèle',
  'ui.ai.prompt.copyResultTitle': 'Copier le résultat dans le presse-papiers',

  'ui.dlg.cstTemplate.header': 'Création d’une constituante à partir d’un modèle',
  'ui.dlg.cstTemplate.tabTemplate.title': 'Choix du modèle d’expression',
  'ui.dlg.cstTemplate.tabArgs.title': 'Substitution des arguments du modèle',

  'ui.dlg.createVersion.onlySelected': 'Constituantes sélectionnées uniquement [{n} sur {total}]',

  'ui.dlg.uploadRsform.loadMetadata': 'Charger le titre et le commentaire',
  'ui.dlg.uploadRsform.warningBody':
    'En important depuis un fichier, toutes les constituantes du schéma actuel seront supprimées',

  'ui.oss.argumentPickLabel': 'Choix des arguments : [ {count} ]',

  'ui.dlg.createBlock.tabChildren.title': 'Nœuds imbriqués : [{count}]',

  'ui.placeholder.sourceSchema': 'Schéma source',
  'ui.placeholder.targetSchema': 'Schéma cible',
  'ui.title.relocationDirection': 'Sens du déplacement',

  'ui.dlg.editCst.titleDetailedEdit': 'Édition détaillée',
  'ui.dlg.editCst.titleGoToAncestor': 'Aller à l’ancêtre',

  'ui.label.attributingConstituents': 'Constituantes attributives',

  'ui.tab.inlineSynthesis.schemaTitle': 'Source des constituantes',
  'ui.tab.inlineSynthesis.selectSchemaFirst': 'Sélectionnez un schéma',
  'ui.tab.inlineSynthesis.constituentsTitle': 'Liste des constituantes',
  'ui.tab.inlineSynthesis.substitutionsTitle': 'Tableau des substitutions',
  'ui.placeholder.schemaNotSelected': 'Aucun schéma sélectionné',

  'ui.validation.termEmpty': 'Terme vide',
  'ui.validation.termHomonyms': 'Le terme coïncide avec des constituantes : {aliases}',
  'ui.placeholder.expressionMissing': 'Expression absente',
  'ui.placeholder.termMissing': 'Terme absent',
  'ui.placeholder.definitionMissing': 'Définition absente',

  'ui.dlg.createSynthesis.header': 'Création d’opération de synthèse',
  'ui.tab.oss.passportTitle': 'Champs texte',
  'ui.tab.oss.operationArgumentsTitle': 'Choix des arguments de l’opération',

  'ui.dlg.changeLocation.invalidHint':
    'Lettres, chiffres, soulignement, espace et « ! » autorisés. Un segment ne peut ni commencer ni se terminer par un espace. La longueur totale (racine incluse) ne doit pas dépasser {maxLen}',

  'ui.aria.copyLinkToClipboard': 'Copier le lien dans le presse-papiers',
  'ui.action.openInSandbox': 'Ouvrir dans le bac à sable',

  'ui.sandbox.saveToFileHint': 'Télécharger les données du bac à sable en JSON',
  'ui.sandbox.loadFromFileHint': 'Charger les données du bac à sable depuis un JSON',
  'ui.sandbox.createSchemaHint': 'Créer un nouveau schéma conceptuel à partir des données du bac à sable',
  'ui.sandbox.createModelHint': 'Créer un nouveau schéma et modèle conceptuels à partir des données du bac à sable',
  'ui.sandbox.resetStateHint': 'Restaurer les données initiales du bac à sable',

  'ui.substitution.acceptSuggestion': 'Accepter la suggestion',
  'ui.substitution.ignoreSuggestion': 'Ignorer la suggestion',
  'ui.substitution.replaceRight': 'Remplacer la droite',
  'ui.substitution.replaceLeft': 'Remplacer la gauche',
  'ui.substitution.addToTable': 'Ajouter au tableau des substitutions',
  'ui.substitution.tableEmptyHint': 'Ajoutez une substitution',

  'ui.cst.crucialRemoveTitle': 'Retirer le statut clé',
  'ui.cst.crucialAddTitle': 'Marquer comme constituante clé',
  'ui.cst.crucialBadgeOn': 'clé',
  'ui.cst.crucialBadgeOff': 'standard',

  'ui.cst.gotoSourceInOss': 'Aller à la constituante source dans le SO',
  'ui.cst.noPredecessor': 'La constituante n’a pas d’ancêtre',

  'ui.rsmodel.calculateCurrentCst': 'Calculer la constituante courante',

  'ui.oss.menu.selectOriginal': 'Sélectionner l’original',
  'ui.oss.menu.cloneResultSchemaTitle': 'Créer et charger une copie du schéma conceptuel',

  'ui.versioning.cannotRevertOss': 'Impossible de revenir en arrière sur un schéma\nrattaché au système opérationnel',
  'ui.versioning.revertToVersion': 'Revenir à la version',
  'ui.versioning.switchToStaleVersion': 'Passez à une version\nnon actuelle',
  'ui.versioning.revertSelectedAria': 'Revenir à la version sélectionnée',
  'ui.versioning.switchToLatestVersion': 'Passez à la version\nactuelle',
  'ui.versioning.switchLatestAria': 'Passer à la version actuelle'
};
