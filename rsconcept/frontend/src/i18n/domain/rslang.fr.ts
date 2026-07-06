export const txRslangFr: Record<string, string> = {
  'tx.rslang': 'Langage des genres de structures',
  'tx.rslang.short': 'Explication',
  'tx.rslang.hint': 'Langage des genres de structures et son usage',

  'tx.rsexpression': 'Expression',
  'tx.rsexpression.templateBank': 'Banque d’expressions',
  'tx.rsexpression.templateBank.hint': 'Collection de modèles paramétrés utilisés comme modèles',

  'tx.rsexpression.logic': 'Expressions logiques',
  'tx.rsexpression.logic.hint':
    'Expressions utilisant des prédicats, connecteurs logiques et des quantificateurs, dont les valeurs sont VRAI ou FAUX',
  'tx.rsexpression.set': 'Expressions ensemblistes',
  'tx.rsexpression.set.short': 'Opérations sur les ensembles',
  'tx.rsexpression.set.hint': 'Opérations d’union, intersection, différence et différence symétrique des ensembles',
  'tx.rsexpression.structure': 'Expressions structurelles',
  'tx.rsexpression.structure.hint': 'Opérations sur la structure des éléments, transformations de typifications',
  'tx.rsexpression.arithmetic': 'Expressions arithmétiques',
  'tx.rsexpression.arithmetic.short': 'Arithmétique',
  'tx.rsexpression.arithmetic.hint': 'Expressions arithmétiques, opérations sur les nombres entiers',
  'tx.rsexpression.quantifier': 'Formes quantifiées',
  'tx.rsexpression.quantifier.hint': 'Expressions utilisant des déclarations quantifiées de variables locales',
  'tx.rsexpression.declarative': 'Expressions déclaratives',
  'tx.rsexpression.declarative.short': 'Expressions déclaratives',
  'tx.rsexpression.declarative.hint':
    'Expressions de termes, produisant un sous-ensemble des éléments d’un ensemble par une condition logique',
  'tx.rsexpression.imperative': 'Expressions impératives',
  'tx.rsexpression.imperative.short': 'Expressions impératives',
  'tx.rsexpression.imperative.hint':
    'Expressions permettant de construire des éléments d’un ensemble par des parcours successifs, des affectations et des vérifications de conditions',
  'tx.rsexpression.recursive': 'Expressions cycliques (récursives)',
  'tx.rsexpression.recursive.short': 'Expressions récursives',
  'tx.rsexpression.recursive.hint':
    'Expressions permettant de construire des éléments d’un ensemble par des calculs cycliques',
  'tx.rsexpression.parameter': 'Expressions paramétrées',
  'tx.rsexpression.parameter.short': 'Paramétrées',
  'tx.rsexpression.parameter.hint': 'Expressions utilisant des paramètres externes',

  'tx.rsexpression.extract': 'Isoler',
  'tx.rsexpression.extract.hint': 'Extraire la sous-expression sélectionnée vers une nouvelle constituante',
  'tx.rsexpression.extract.confirm': 'Confirmer l’isolement de la sous-expression sélectionnée',
  'tx.rsexpression.analyze': 'Vérifier l’expression',
  'tx.rsexpression.saveAndCalculate': 'Enregistrer et calculer',
  'tx.rsexpression.keyboard': 'Clavier de symboles',
  'tx.rsexpression.ast': 'Arbre de syntaxe',
  'tx.rsexpression.ast.hint': 'Consultation de l’arbre de syntaxe d’une expression structurelle',
  'tx.rsexpression.ast.fail': 'Impossible de construire l’arbre de syntaxe',

  'tx.rsexpression.class.logic': 'Logique',
  'tx.rsexpression.class.typification': 'Ensembliste',
  'tx.rsexpression.class.function': 'Fonction terme',
  'tx.rsexpression.class.predicate': 'Fonction prédicat',

  'tx.rslang.type': 'Type',
  'tx.rslang.typification': 'Typification',
  'tx.rslang.typification.hint': 'Système de types dans l’explication structurelle',
  'tx.rslang.typification.manual': 'Typification manuelle',
  'tx.rslang.typification.manual.add': 'Ajouter une typification manuelle',
  'tx.rslang.typification.manual.hint': 'Définissez une typification manuelle dans le format [X1, B(X1)] -> Z*C1',
  'tx.rslang.typification.manual.validate':
    'La typification manuelle ne correspond pas à la typification déduite de la définition formelle',
  'tx.rslang.cardinality': 'Cardinalité',
  'tx.rslang.template.parameter': 'Paramètre de modèle',

  'tx.rslang.eval.success': 'Calculs terminés en {timeSpent} s',
  'tx.rslang.eval.iterationCount': 'Itérations',
  'tx.rslang.eval.cacheHits': 'Hits de cache',
  'tx.rslang.eval.disableCache.hint': 'Désactiver le cache d’évaluation',

  'tx.rslang.binding': 'Interprétation de base',
  'tx.rslang.binding.hint': 'Édition de l’interprétation de base du modèle',
  'tx.rslang.binding.view': 'Consulter l’interprétation de base',
  'tx.rslang.binding.edit': 'Éditeur de l’interprétation de base',
  'tx.rslang.binding.load.validate':
    'Format de données invalide. Utilisez JSON de la forme { "1": "value1", "2": "value2", ... }',

  'tx.rslang.value': 'Valeur d’expression',
  'tx.rslang.value.short': 'Valeur',
  'tx.rslang.value.type.error.hint': 'Aucune valeur prévue pour ce type',
  'tx.rslang.value.input.hint': 'Entrez une valeur',
  'tx.rslang.value.none': 'Valeur absente',
  'tx.rslang.value.none.hint': 'Valeur absente. Utilisez « Valeur aléatoire » pour générer un exemple',
  'tx.rslang.value.render.tooLarge.hint': 'Valeur trop volumineuse — utilisez « Consulter la valeur »',
  'tx.rslang.value.view': 'Consulter la valeur',
  'tx.rslang.value.view.wrongType': 'Consulter la valeur n’est pas disponible pour ce type',
  'tx.rslang.value.view.reset': 'Valeur entière',
  'tx.rslang.value.edit': 'Modifier la valeur',
  'tx.rslang.value.edit.hint': 'Vue structurée et édition d’une valeur unique',
  'tx.rslang.value.edit.fail': 'Impossible de modifier la valeur',
  'tx.rslang.value.editor': 'Éditeur de valeur',
  'tx.rslang.value.load.validate':
    'Format de données invalide. Utilisez JSON contenant uniquement des nombres et des tableaux',
  'tx.rslang.value.load.success': 'Valeur chargée',
  'tx.rslang.value.reset': 'Réinitialiser la valeur',
  'tx.rslang.value.reset.hint': 'Réinitialiser la valeur de la constituante',
  'tx.rslang.value.reset.success': 'Données réinitialisées',
  'tx.rslang.value.export': 'Exporter la valeur',
  'tx.rslang.value.import': 'Importer une valeur',
  'tx.rslang.value.add.random': 'Ajouter des valeurs aléatoires',
  'tx.rslang.value.add.random.hint': 'Générer des valeurs aléatoires pour la constituante courante',
  'tx.rslang.value.add.random.fail': 'Impossible de générer des valeurs aléatoires: l’ensemble est vide',

  'tx.rslang.valueClass.full': 'Valeur entière',
  'tx.rslang.valueClass.full.hint':
    'Interprétation itérable et de puissance\nCliquez pour passer à la "non dimensionnelle"',
  'tx.rslang.valueClass.property': 'Valeur non dimensionnelle',
  'tx.rslang.valueClass.property.hint':
    'Interprétation non itérable, vérification d’appartenance\nCliquez pour passer à la "valeur entière"',

  'tx.rslang.value.stub': 'Abréviation de la valeur',
  'tx.rslang.value.stub.hint': 'Libellé | cardinalité',
  'tx.rslang.value.stub.status': 'Cardinalité : {n} | {stub}',

  'tx.rslang.value.element.add': 'Ajouter un élément',
  'tx.rslang.value.element.visibility.hint': 'Afficher les données en texte',
  'tx.rslang.value.element.edit.hint': 'Sélectionner un élément à modifier',

  'tx.rslang.token.boolean': 'Ensemble des parties',
  'tx.rslang.token.decart': 'Produit cartésien',
  'tx.rslang.token.punctuationPl': 'Parenthèses () autour de l’expression',
  'tx.rslang.token.punctuationSl': 'Crochets [] autour de l’expression',
  'tx.rslang.token.quantorUniversal': 'Quantificateur universel',
  'tx.rslang.token.quantorExists': 'Quantificateur existentiel',
  'tx.rslang.token.logicNot': 'Négation',
  'tx.rslang.token.logicAnd': 'Conjonction',
  'tx.rslang.token.logicOr': 'Disjonction',
  'tx.rslang.token.logicImplication': 'Implication',
  'tx.rslang.token.logicEquivalent': 'Équivalence',
  'tx.rslang.token.litEmptyset': 'Ensemble vide',
  'tx.rslang.token.litWholeNumbers': 'Entiers',
  'tx.rslang.token.equal': 'Égalité',
  'tx.rslang.token.multiply': 'Multiplication de nombres',
  'tx.rslang.token.notequal': 'Inégalité',
  'tx.rslang.token.greaterOrEq': 'Supérieur ou égal',
  'tx.rslang.token.lesserOrEq': 'Inférieur ou égal',
  'tx.rslang.token.setIn': 'Appartenance (∈)',
  'tx.rslang.token.setNotIn': 'Non-appartenance',
  'tx.rslang.token.subsetOrEq': 'Sous-ensemble (large)',
  'tx.rslang.token.subset': 'Sous-ensemble strict',
  'tx.rslang.token.notSubset': 'Pas un sous-ensemble',
  'tx.rslang.token.setIntersection': 'Intersection',
  'tx.rslang.token.setUnion': 'Union',
  'tx.rslang.token.setMinus': 'Différence d’ensembles',
  'tx.rslang.token.setSymmetricMinus': 'Différence symétrique',
  'tx.rslang.token.ntDeclarativeExpr': 'Définition déclarative',
  'tx.rslang.token.ntImperativeExpr': 'Définition impérative',
  'tx.rslang.token.ntRecursiveFull': 'Définition récursive (cycle)',
  'tx.rslang.token.bigpr': 'Grande projection',
  'tx.rslang.token.smallpr': 'Petite projection',
  'tx.rslang.token.filter': 'Filtre',
  'tx.rslang.token.reduce': 'Somme d’ensembles',
  'tx.rslang.token.bool': 'Singleton',
  'tx.rslang.token.debool': 'Désingleton',
  'tx.rslang.token.assign': 'Affectation',
  'tx.rslang.token.iterate': 'Parcourir les éléments de l’ensemble',

  'tx.rslang.error.unknownSyntax': 'L’expression contient une erreur de syntaxe. Vérifiez le fragment sélectionné',
  'tx.rslang.error.forbiddenCharacter': 'Le caractère « {character} » n’est pas utilisé dans les expressions formelles',
  'tx.rslang.error.bracketMismatch':
    'La parenthèse est fermée par un autre type : « {expected} » attendu, « {actual} » trouvé',
  'tx.rslang.error.doubleParenthesis':
    'Paire de parenthèses externe en trop : utilisez une seule paire au lieu de ((...))',
  'tx.rslang.error.missingOpenBracket':
    'Parenthèse fermante « {bracket} » sans paire. Supprimez-la ou ajoutez une ouvrante',
  'tx.rslang.error.missingCloseBracket':
    'Parenthèse ouvrante « {bracket} » sans paire. Supprimez-la ou ajoutez une fermante',
  'tx.rslang.error.invalidFilterSyntax':
    'Le filtre s’écrit Fiindices[paramètres](argument), par exemple Fi1[D1](S1) ou Fi1,2[D1,D2](S1)',
  'tx.rslang.error.expectedFunctionBody': 'Ajoutez un corps de fonction après la déclaration des arguments',
  'tx.rslang.error.expectedExpressionBody':
    'Ajoutez une expression de fonction-terme après la déclaration des arguments',
  'tx.rslang.error.expectedLogicBody':
    'Ajoutez une expression logique de fonction-prédicat après la déclaration des arguments',
  'tx.rslang.error.expectedQuantifierBody': 'Ajoutez une expression logique après le domaine du quantificateur',
  'tx.rslang.error.expectedDeclarativeBody': 'Complétez l’expression déclarative D{variable ∈ domaine | condition}',
  'tx.rslang.error.expectedImperativeBody':
    'Complétez l’expression impérative I{tuple | blocs d’instructions séparés par ";" }',
  'tx.rslang.error.expectedRecursiveBody':
    'Complétez l’expression récursive R{variable := départ | optionnellement condition de continuation | étape}',
  'tx.rslang.error.expectedQuantifierDomain': 'Après la variable du quantificateur, indiquez ∈ et le domaine',
  'tx.rslang.error.expectedRightOperand': 'Ajoutez l’opérande de droite après l’opérateur',
  'tx.rslang.error.expectedUnaryOperand': 'Ajoutez une expression après ¬',
  'tx.rslang.error.globalFuncParenCall': 'Appelez une fonction ou un prédicat avec des crochets : {name}[…]',
  'tx.rslang.error.expectedArgument': 'Ajoutez l’argument manquant dans la liste',
  'tx.rslang.error.expectedLocal': 'Une variable locale est requise ici',
  'tx.rslang.error.expectedType': 'Classe d’expression attendue : « {expected} » ; obtenu {actual}',
  'tx.rslang.error.localDoubleDeclare':
    "L'identifiant « {name} » est déjà déclaré dans cette expression — utilisez un autre nom",
  'tx.rslang.error.localNotUsed': 'La variable locale est déclarée mais non utilisée : {name}',
  'tx.rslang.error.localUndeclared': 'La variable locale n’est pas déclarée dans cette portée : {name}',
  'tx.rslang.error.localShadowing': 'Ce nom de variable locale est déjà utilisé dans cette portée : {name}',
  'tx.rslang.error.typesNotEqual': 'L’opérateur « {operator} » requiert des types identiques, obtenu {a} et {b}',
  'tx.rslang.error.globalNotTyped': 'L’identifiant n’a pas de typification : {name}',
  'tx.rslang.error.invalidDecart': 'Le produit cartésien ne peut être construit qu’à partir d’ensembles ; obtenu {arg}',
  'tx.rslang.error.invalidBoolean': 'Le booléen ne peut être construit qu’à partir d’un ensemble ; obtenu {arg}',
  'tx.rslang.error.invalidTypeOperation':
    'L’opérateur « {operator} » s’applique aux ensembles ; le type {type} ne convient pas',
  'tx.rslang.error.invalidCard': 'La cardinalité ne peut être calculée que pour un ensemble ; obtenu {arg}',
  'tx.rslang.error.invalidDebool': 'debool retire un niveau booléen ; obtenu {arg}',
  'tx.rslang.error.globalFuncWithoutArgs': 'Appelez la fonction ou le prédicat avec des arguments : {name}[…]',
  'tx.rslang.error.invalidReduce': 'red s’applique à un ensemble d’ensembles ; obtenu {arg}',
  'tx.rslang.error.projectionSetArgumentNotSet':
    'La grande projection {operator} s’applique à un ensemble ; obtenu {actual}',
  'tx.rslang.error.projectionSetArgumentNotTupleSet':
    'La grande projection {operator} s’applique à un ensemble de n-uplets ℬ(H1×…×Hn) ; obtenu {actual}',
  'tx.rslang.error.projectionSetIndexOutOfRange':
    'Dans {operator}, l’indice {index} dépasse la dimension {arity} de l’argument {actual}',
  'tx.rslang.error.projectionTupleArgumentNotTuple':
    'La petite projection {operator} s’applique à un n-uplet H1×…×Hn ; obtenu {actual}',
  'tx.rslang.error.projectionTupleIndexOutOfRange':
    'Dans {operator}, l’indice {index} dépasse la dimension {arity} du n-uplet {actual}',
  'tx.rslang.error.invalidEnumeration':
    'Tous les éléments d’une énumération doivent avoir un seul type : {a} et {b} diffèrent',
  'tx.rslang.error.invalidCortegeDeclare':
    'Le nombre de variables du n-uplet ne correspond pas à la dimension du produit cartésien',
  'tx.rslang.error.localOutOfScope': 'La variable _{name}_ est utilisée hors de la portée de sa définition',
  'tx.rslang.error.localOutOfScopeParentheses':
    'La variable _{name}_ est hors portée : l’expression logique complexe doit probablement être entre parenthèses',
  'tx.rslang.error.localUndeclaredInSubexpr':
    'La variable _{name}_ n’est pas définie pour cette sous-expression. Attendu : ∀(∃) {name}∈{domain}',
  'tx.rslang.error.invalidElementPredicate':
    'L’opérateur « {b} » compare un élément avec un ensemble ; le type {a} est incompatible avec {c}',
  'tx.rslang.error.invalidEmptySetUsage': 'L’ensemble vide ne peut pas être utilisé ici sans préciser son type',
  'tx.rslang.error.invalidArgsArity': 'Nombre d’arguments incorrect : attendu {a}, reçu {b}',
  'tx.rslang.error.invalidArgumentType': 'L’argument a une typification incorrecte : attendu {expected}, reçu {actual}',
  'tx.rslang.error.globalStructure':
    'Le domaine de définition de la structure générique est non valide. Utilisez une échelle de structure via ℬ et ×. En plus des ensembles de base et constants, vous pouvez utiliser des termes et d’autres structures génériques',
  'tx.rslang.error.radicalUsage': 'Le radical {name} ne peut être utilisé que dans une déclaration',
  'tx.rslang.error.invalidFilterArgumentType':
    'Le filtre {operator} requiert un argument de type {expected} ; reçu {actual}',
  'tx.rslang.error.invalidFilterArity':
    'Le filtre {operator} requiert des paramètres selon le nombre d’indices : attendu {indexCount}, reçu {paramCount}',
  'tx.rslang.error.invalidFilterParameterType':
    'Le paramètre du filtre a le type {param}, mais {operator} requiert {expected}',
  'tx.rslang.error.invalidFilterIndex':
    'Dans le filtre {operator}, l’indice {index} dépasse la dimension {arity} de l’argument {actual}',
  'tx.rslang.error.invalidFilterBooleanEchelon':
    'Le paramètre du filtre a le type {actual} — ce n’est pas le bon ensemble (un niveau ℬ trop bas). Pour {operator}, mettez un élément entre accolades `{…}` ou passez un ensemble au niveau requis ; sinon vérifiez la sémantique du paramètre',
  'tx.rslang.error.arithmeticNotSupported':
    'L’opérateur « {operator} » fonctionne avec des nombres ; le type {type} ne convient pas',
  'tx.rslang.error.typesNotCompatible': 'L’opérateur « {operator} » ne peut pas être appliqué aux types {a} et {b}',
  'tx.rslang.error.orderingNotSupported':
    'L’opérateur de comparaison « {operator} » ne prend pas en charge le type {type}',
  'tx.rslang.error.expectedLogic': 'Expression logique attendue ; obtenu {type}',
  'tx.rslang.error.expectedSetexpr': 'Expression ensembliste attendue ; obtenu {type}',
  'tx.rslang.error.invalidArgumentCortegeDeclare':
    'La déclaration liée dans les arguments de fonction n’est pas autorisée. Utilisez des projections ou déclarez les variables séparément',
  'tx.rslang.error.invalidQuantifierDomain':
    'La déclaration du quantificateur « {operator} » requiert un domaine ensemble ; obtenu {type}',
  'tx.rslang.error.globalNoValue': 'L’identifiant ne peut pas être évalué : {name}',
  'tx.rslang.error.invalidPropertyUsage':
    'Cet ensemble n’est pas itérable, il ne peut donc pas être utilisé comme valeur prête',
  'tx.rslang.error.cstEmptyDerived': 'Une notion complexe ou un énoncé doit avoir une expression',
  'tx.rslang.error.definitionNotAllowed':
    'La définition formelle n’est pas autorisée pour {cstType} — laissez le champ vide et précisez le sens dans convention',
  'tx.rslang.error.calcUnknownError': 'Erreur d’évaluation inconnue',
  'tx.rslang.error.calculationNotSupported': 'Une déclaration de fonction ne peut pas être évaluée comme une valeur',
  'tx.rslang.error.setOverflow': 'Trop d’éléments à évaluer : limite {limit}',
  'tx.rslang.error.booleanBaseLimit': 'La base du booléen est trop grande pour l’évaluation : limite {limit}',
  'tx.rslang.error.calcGlobalMissing': 'Aucune valeur n’est définie pour {name}',
  'tx.rslang.error.iterationsLimit': 'Évaluation arrêtée : limite d’itérations {limit} dépassée',
  'tx.rslang.error.calcInvalidDebool': 'debool a été appliqué à une valeur de mauvais type',
  'tx.rslang.error.calcInvalidData': 'L’opérateur « {operator} » ne peut pas être appliqué aux valeurs {a} et {b}',
  'tx.rslang.error.iterateInfinity': 'Impossible de parcourir un ensemble infini',

  'tx.rslang.identifiers': 'Identificateurs',
  'tx.rslang.identifiers.hint': 'Désignations des constituantes, variables locales et littéraux'
};
