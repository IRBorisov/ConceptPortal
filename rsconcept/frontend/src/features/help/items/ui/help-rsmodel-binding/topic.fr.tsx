import { useTx } from '@/i18n';

import { IconNewItem, IconRemove, IconSearch } from '@/components/icons';

export function HelpRSModelBindingFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.binding')}</h1>
      <p>
        Ce dialogue définit le tableau des valeurs des éléments d'un concept non défini (ensemble de base) dans le
        modèle.
      </p>

      <ul>
        <li>sélectionner une ligne pour modifier la valeur de l'élément</li>
        <li>
          <IconSearch className='inline-icon' /> rechercher par le texte de la valeur de l'élément
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> ajouter une nouvelle ligne au modèle
        </li>
        <li>
          <IconRemove className='inline-icon icon-red' /> supprimer une ligne du modèle
        </li>
      </ul>
    </>
  );
}
