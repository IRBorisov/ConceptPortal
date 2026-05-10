import { useTx } from '@/i18n';

import { IconNewItem } from '@/components/icons';
import { isMac } from '@/utils/utils';

export function HelpFormulaTreeFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.ast')}</h1>
      <p>L’arbre d’analyse syntaxique reflète la structure de l’expression.</p>

      <ul>
        <li>Le texte d’un nœud correspond à un élément du langage</li>
        <li>Au survol d’un nœud, le fragment d’expression est mis en surbrillance et la typification s’affiche</li>
        <li>
          <kbd>Espace</kbd> — déplacer la vue sans survoler les nœuds
        </li>
        <li>
          <IconNewItem className='inline-icon' size='1rem' /> <kbd>Q</kbd> — isoler la sous-expression sélectionnée
          dans une nouvelle constituante
        </li>
        <li>
          dans le panneau d’isolement : <kbd>{isMac() ? 'Cmd + S' : 'Ctrl + S'}</kbd> — confirmer l’isolement
        </li>
      </ul>

      <h2>Types de nœuds</h2>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-green' />
        déclaration d’identifiant
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-teal' />
        identifiant global
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-orange' />
        expression logique
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-blue' />
        expression typée
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-red' />
        affectation et itération
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-secondary' />
        expressions composées
      </p>
    </>
  );
}
