/** French UI copy for dialogs and toolbars. */
export const uiFr: Record<string, string> = {
  'ui.action.upload': 'Téléverser',

  'ui.library.editor.openInLibrary': 'Ouvrir dans la bibliothèque',
  'ui.library.editor.pathInheritedOss': 'Chemin hérité de l’OSS',
  'ui.library.editor.ownerInheritedOss': 'Propriétaire hérité de l’OSS',
  'ui.library.pickLocation.explorerTitle': 'Explorateur…',

  'ui.ai.prompt.editTemplateTitle': 'Modifier le modèle',
  'ui.ai.prompt.copyResultTitle': 'Copier le résultat dans le presse-papiers',

  'ui.dlg.createCst.header': 'Création d’une constituante',
  'ui.dlg.cstTemplate.header': 'Création d’une constituante à partir d’un modèle',
  'ui.dlg.cstTemplate.tabTemplate.title': 'Choix du modèle d’expression',
  'ui.dlg.cstTemplate.tabArgs.title': 'Substitution des arguments du modèle',

  'ui.dlg.createVersion.header': 'Création de version',
  'ui.dlg.createVersion.onlySelected': 'Constituantes sélectionnées uniquement [{n} sur {total}]',

  'ui.dlg.editVersions.header': 'Modifier les versions',

  'ui.dlg.uploadRsform.header': 'Importer un schéma depuis Exteor',
  'ui.dlg.uploadRsform.pickFile': 'Choisir un fichier',
  'ui.dlg.uploadRsform.loadMetadata': 'Charger le titre et le commentaire',
  'ui.dlg.uploadRsform.warningBody':
    'En important depuis un fichier, toutes les constituantes du schéma actuel seront supprimées',

  'ui.oss.newBlockTitle': 'Titre du nouveau bloc',
  'ui.oss.newSchemaTitle': 'Titre du nouveau schéma',
  'ui.oss.operationTitle': 'Titre de l’opération',
  'ui.oss.blockTitle': 'Titre du bloc',
  'ui.oss.enterAlias': 'Saisir l’abréviation',
  'ui.oss.argumentPickLabel': 'Choix des arguments : [ {count} ]',

  'ui.dlg.editBlock.header': 'Modifier le bloc',

  'ui.dlg.createBlock.header': 'Création de bloc',
  'ui.dlg.createBlock.tabPassport.title': 'Attributs principaux du bloc',
  'ui.dlg.createBlock.tabChildren.title': 'Nœuds imbriqués : [{count}]',
  'ui.dlg.createBlock.tabChildren.label': 'Contenu{mark}',

  'ui.dlg.clone.headerRsform': 'Créer une copie du schéma conceptuel',
  'ui.dlg.clone.headerRsmodel': 'Créer une copie du modèle conceptuel',

  'ui.tg.selectionCount': 'Sélection {n} sur {total}',

  'ui.dlg.ossOp.importHeader': 'Création d’opération : import',
  'ui.dlg.ossOp.newSchemaHeader': 'Création d’opération : nouveau schéma',
  'ui.label.cloneSchema': 'Cloner le schéma',

  'ui.action.move': 'Déplacer',
  'ui.placeholder.sourceSchema': 'Schéma source',
  'ui.placeholder.targetSchema': 'Schéma cible',
  'ui.title.relocationDirection': 'Sens du déplacement',

  'ui.dlg.renameCst.header': 'Renommer la constituante',

  'ui.dlg.editCst.header': 'Modifier la constituante',
  'ui.dlg.editCst.titleDetailedEdit': 'Édition détaillée',
  'ui.dlg.editCst.titleGoToAncestor': 'Aller à l’ancêtre',

  'ui.placeholder.termForDefinitions': 'Libellé pour les définitions textuelles',
  'ui.label.attributingConstituents': 'Constituantes attributives',
  'ui.placeholder.selectConstituents': 'Sélectionner des constituantes',
  'ui.placeholder.textDefinitionHint': 'Interprétation textuelle de l’expression formelle',
  'ui.placeholder.conventionBasic': 'Accord sur l’interprétation du concept de base',
  'ui.placeholder.developerComment': 'Note du développeur',

  'ui.action.addConstituents': 'Ajouter des constituantes',
  'ui.tab.inlineSynthesis.schemaTitle': 'Source des constituantes',
  'ui.tab.inlineSynthesis.selectSchemaFirst': 'Sélectionnez un schéma',
  'ui.tab.inlineSynthesis.constituentsTitle': 'Liste des constituantes',
  'ui.tab.inlineSynthesis.substitutionsTitle': 'Tableau des substitutions',
  'ui.inlineSynthesis.selected': 'Sélectionnée',
  'ui.placeholder.schemaNotSelected': 'Aucun schéma sélectionné',

  'ui.validation.termEmpty': 'Terme vide',
  'ui.validation.termHomonyms': 'Le terme coïncide avec des constituantes : {aliases}',
  'ui.validation.conventionEmpty': 'Convention vide',
  'ui.placeholder.expressionMissing': 'Expression absente',
  'ui.placeholder.termMissing': 'Terme absent',
  'ui.placeholder.definitionMissing': 'Définition absente',

  'ui.dlg.createSynthesis.header': 'Création d’opération de synthèse',
  'ui.dlg.editOperation.header': 'Modifier l’opération',
  'ui.tab.oss.passportTitle': 'Champs texte',
  'ui.tab.oss.operationArgumentsTitle': 'Choix des arguments de l’opération',

  'ui.dlg.changeLocation.header': 'Modifier l’emplacement',
  'ui.dlg.changeLocation.invalidHint':
    'Lettres, chiffres, soulignement, espace et « ! » autorisés. Un segment ne peut ni commencer ni se terminer par un espace. La longueur totale (racine incluse) ne doit pas dépasser {maxLen}',

  'ui.field.rsformTitle': 'Titre du schéma',
  'ui.field.rsmodelTitle': 'Titre du modèle',
  'ui.field.ossTitle': 'Titre du système opérationnel',

  'ui.aria.recalculateAll': 'Recalculer tous les résultats',
  'ui.aria.copyLinkToClipboard': 'Copier le lien dans le presse-papiers',
  'ui.action.qrCode': 'Code QR',
  'ui.hint.qrSchemaPage': 'Afficher le code QR du schéma',
  'ui.action.openInSandbox': 'Ouvrir dans le bac à sable',
  'ui.action.exportPdf': 'Exporter en PDF',
  'ui.action.exportToExteor': 'Exporter vers Exteor',
  'ui.action.importFromExteor': 'Importer depuis Exteor',

  'ui.sandbox.saveToFile': 'Enregistrer dans un fichier',
  'ui.sandbox.saveToFileHint': 'Télécharger les données du bac à sable en JSON',
  'ui.sandbox.loadFromFile': 'Charger depuis un fichier',
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

  'ui.action.exportData': 'Exporter les données',

  'ui.ai.deleteTemplate': 'Supprimer le modèle',

  'ui.cst.crucialRemoveTitle': 'Retirer le statut clé',
  'ui.cst.crucialAddTitle': 'Marquer comme constituante clé',
  'ui.cst.crucialBadgeOn': 'clé',
  'ui.cst.crucialBadgeOff': 'standard',
  'ui.hint.renameCst': 'Renommer la constituante',
  'ui.action.expandStructure': 'Développer la structure',
  'ui.hint.conceptStructure': 'Gérer la structure du concept',

  'ui.cst.gotoSourceInOss': 'Aller à la constituante source dans le SO',
  'ui.cst.noPredecessor': 'La constituante n’a pas d’ancêtre',
  'ui.hint.resetUnsavedChanges': 'Annuler les modifications non enregistrées',

  'ui.eval.viewValue': 'Voir la valeur',
  'ui.eval.viewStructuredUnavailable': 'L’affichage structuré de la valeur\nn’est pas disponible pour ce type',
  'ui.action.exportShort': 'Exporter',
  'ui.eval.copyToClipboard': 'Copier dans le presse-papiers',
  'ui.eval.saveAsJson': 'Enregistrer en JSON',
  'ui.rsmodel.calculateCurrentCst': 'Calculer la constituante courante',

  'ui.oss.menu.editOperation': 'Modifier l’opération',
  'ui.oss.menu.selectOriginal': 'Sélectionner l’original',
  'ui.oss.menu.openLinkedRsform': 'Ouvrir le schéma conceptuel lié',
  'ui.hint.doubleClick': 'Double-clic',
  'ui.oss.menu.createEmptySchemaTitle': 'Créer un schéma vide',
  'ui.oss.menu.loadSchema': 'Charger le schéma',
  'ui.oss.menu.changeSchema': 'Modifier le schéma',
  'ui.oss.menu.pickSchemaTitle': 'Choisir un schéma à charger',
  'ui.oss.menu.activateSynthesis': 'Activer la synthèse',
  'ui.oss.menu.activateSynthesisReadyTitle': 'Activer l’opération\net obtenir le schéma conceptuel synthétisé',
  'ui.oss.menu.activateSynthesisNeedArgs': 'Tous les arguments doivent être fournis',
  'ui.oss.menu.activateSynthesisAria': 'Activer l’opération et obtenir le schéma conceptuel synthétisé',
  'ui.oss.menu.cloneResultSchemaTitle': 'Créer et charger une copie du schéma conceptuel',

  'ui.versioning.cannotRevertOss': 'Impossible de revenir en arrière sur un schéma\nrattaché au système opérationnel',
  'ui.versioning.revertToVersion': 'Revenir à la version',
  'ui.versioning.switchToStaleVersion': 'Passez à une version\nnon actuelle',
  'ui.versioning.revertSelectedAria': 'Revenir à la version sélectionnée',
  'ui.versioning.createVersion': 'Créer une version',
  'ui.versioning.switchToLatestVersion': 'Passez à la version\nactuelle',
  'ui.versioning.switchLatestAria': 'Passer à la version actuelle',
  'ui.versioning.listEmpty': 'La liste des versions est vide',
  'ui.versioning.editVersions': 'Modifier les versions',

  'ui.action.importShort': 'Importer'
};
