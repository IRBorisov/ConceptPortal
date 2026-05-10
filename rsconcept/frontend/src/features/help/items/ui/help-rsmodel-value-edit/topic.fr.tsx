import { useTx } from '@/i18n';

import { IconNewItem, IconRemove, IconReset, IconText } from '@/components/icons';

export function HelpRSModelValueEditFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.value.editor')}</h1>
      <p>Ce dialogue ouvre une valeur individuelle dans une vue structurée</p>
      <p>Seuls les éléments d'une structure sont affichés à la fois ; les sous-ensembles imbriqués se déploient au clic</p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>les en-têtes et les étiquettes aident à naviguer dans les composants imbriqués de la valeur</li>
        <li>cliquez sur une valeur pour la modifier</li>
        <li>
          <span className='text-accent-red-foreground'>rouge</span> indique les identifiants et ensembles incorrects
        </li>
        <li>
          <span className='text-accent-green-foreground'>vert</span> indique les résultats filtrés
        </li>
        <li>
          <IconReset className='inline-icon' /> afficher l'ensemble d'origine
        </li>
        <li>
          <IconText className='inline-icon' /> afficher texte ou identifiants
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> ajouter un nouvel élément à l'ensemble actuel
        </li>
        <li>
          <IconRemove className='inline-icon icon-red' /> supprimer un élément de l'ensemble actuel
        </li>
      </ul>
    </>
  );
}
