import { useTx } from '@/i18n';

export function HelpRSLangTemplatesFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.templateBank')}</h1>
      <p>
        Le Portail fournit un accès rapide aux expressions fréquemment utilisées grâce à la fonctionnalité de création
        de constituants depuis un modèle.
      </p>
      <p>
        La source des modèles est la <b>Banque d'expressions</b>, qui contient des concepts et des assertions paramétrés
        regroupés par sections.
      </p>

      <h2>Déroulement</h2>
      <ul>
        <li>
          Sélectionner d'abord un modèle d'expression (onglet <b>Modèle</b>)
        </li>
        <li>
          Fixer ensuite les valeurs des arguments en choisissant des constituantes du schéma courant (onglet{' '}
          <b>Arguments</b>)
        </li>
        <li>
          Les valeurs des arguments sont substituées dans l'expression, y compris l'ajustement de la liste des
          paramètres
        </li>
        <li>
          Si des valeurs sont fournies pour tous les arguments, le type de la constituante à créer est mis à jour
          automatiquement
        </li>
        <li>
          Dans l'onglet <b>Constituant</b>, vous pouvez modifier les attributs de la constituante principale (choisie)
        </li>
        <li>
          Le bouton <b>Créer</b> ajoute au schéma toutes les constituantes nécessaires (voir ci-dessous)
        </li>
      </ul>

      <h2>Quelles constituantes sont créées</h2>
      <p>
        Outre le modèle sélectionné, le schéma reçoit toutes les fonctions terme et fonctions prédicat de la banque
        utilisées dans son expression et absentes du schéma courant. Les constituantes déjà présentes ne sont pas
        dupliquées.
      </p>
      <p>
        Les dépendances sont insérées dans un ordre qui préserve les références : d'abord les fonctions auxiliaires,
        puis la constituante principale.
      </p>

      <h2>Substitution des arguments</h2>
      <p>
        Les valeurs choisies dans l'onglet <b>Arguments</b> se propagent aux appels imbriqués de fonctions terme et de
        fonctions prédicat issues de la banque : les désignations globales correspondantes du schéma sont substituées
        dans les paramètres des constituantes auxiliaires.
      </p>
      <p>
        Si tous les paramètres d'une fonction auxiliaire reçoivent une valeur après substitution, elle est créée comme
        terme ou axiome ; avec une substitution partielle, elle reste une fonction terme ou une fonction prédicat avec
        une liste de paramètres réduite.
      </p>
      <p>
        Les références aux noms de la banque dans les définitions formelles sont remplacées par de nouveaux noms générés
        dans le schéma cible.
      </p>
    </>
  );
}
