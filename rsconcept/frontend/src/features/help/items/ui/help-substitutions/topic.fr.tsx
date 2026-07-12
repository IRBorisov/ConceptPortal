import { useTx } from '@/i18n';

export function HelpSubstitutionsFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.substitution.table')}</h1>
      <p>Une paire d'identifications désignant le remplacement des occurrences d'un constituant par un autre.</p>
      <p>
        La table d'identifications impose les contraintes suivantes :
        <ul>
          <li>un constituant ne peut être l'élément supprimé que dans une seule identification</li>
          <li>les constituants supprimés ne peuvent pas être des substituts dans les identifications</li>
          <li>les ensembles de base ne peuvent remplacer que d'autres ensembles de base</li>
          <li>les ensembles constants ne peuvent remplacer que d'autres ensembles constants</li>
          <li>
            lors de l'identification de constituants autres que des ensembles de base et constants, leurs typifications
            doivent coïncider, en tenant compte des autres identifications
          </li>
          <li>les expressions logiques ne peuvent remplacer que d'autres expressions logiques</li>
          <li>
            lors de l'identification de constituants paramétrés, le nombre et les typifications des arguments doivent
            correspondre
          </li>
          <li>après application de la table, il ne doit pas y avoir de cycle logique dans les définitions formelles</li>
        </ul>
      </p>
    </>
  );
}
