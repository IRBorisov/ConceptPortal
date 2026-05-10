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
        La source des modèles est la <b>Banque d'expressions</b>, qui contient des concepts et des assertions
        paramétrés regroupés par sections.
      </p>
      <ul>
        <li>Sélectionner d'abord un modèle d'expression (onglet Modèle)</li>
        <li>
          Ensuite, pour les arguments, vous pouvez fixer des valeurs en les sélectionnant parmi les constituants du
          schéma courant ou en spécifiant des expressions (onglet Arguments)
        </li>
        <li>Les valeurs des arguments seront substituées dans l'expression, y compris l'ajustement de la liste des arguments</li>
        <li>
          Si des valeurs sont fournies pour tous les arguments, le type du constituant à créer est mis à jour
          automatiquement
        </li>
        <li>Dans l'onglet Constituant, vous pouvez ajuster tous les attributs du constituant en cours de création</li>
        <li>
          Le bouton <b>Créer</b> initie l'ajout du constituant sélectionné au schéma
        </li>
      </ul>
    </>
  );
}
