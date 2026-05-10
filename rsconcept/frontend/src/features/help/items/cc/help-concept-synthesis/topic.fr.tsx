import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptSynthesisFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.synthesis.short')}</h1>
      <p>
        Le travail avec de grands domaines d'application nécessite d'examiner différents points de vue au sein d'un
        même domaine, c'est-à-dire de former une série de schémas conceptuels séparés. En même temps, les concepts clés
        pour la production de solutions nécessitent de combiner les capacités expressives de ces schémas.
      </p>

      <p>
        La solution à ce problème est l'introduction d'une opération formelle de{' '}
        <b>synthèse de schémas conceptuels</b>. Le schéma conceptuel produit par cette opération doit unir les
        capacités expressives des schémas sources et contenir des concepts non exprimables dans les schémas sources
        individuellement.
      </p>

      <p>
        L'extension de la capacité expressive est atteinte par plusieurs moyens selon le rapport entre les points de
        vue synthétisés :
        <ul>
          <li>
            <b>la synthèse aspectuelle</b> est caractérisée par l'identification de concepts communs lorsque certains
            concepts indéfinis sont partagés entre deux points de vue ;
          </li>
          <li>
            <b>la synthèse de concrétisation</b> remplace un concept indéfini faiblement contraint d'un schéma par un
            concept de base ou dérivé plus contraint et concret d'un autre schéma ;
          </li>
          <li>
            <b>la synthèse par une nouvelle relation</b> utilise, en plus des schémas sources, un schéma abstrait
            (sans interprétation de domaine) pour connecter des concepts de deux opérandes en introduisant un nouveau
            concept indéfini modélisant la relation entre les schémas synthétisés.
          </li>
        </ul>
      </p>
      <p>
        Les combinaisons des approches décrites au sein d'une seule synthèse sont prises en charge. Plus de détails sur
        l'implémentation des opérations en forme de genres de structures peuvent être trouvés dans la{' '}
        <LinkTopic text='section Opérations' topic={HelpTopic.RSL_OPERATIONS} />.
      </p>
      <p>
        Pour gérer l'ensemble des synthèses, on utilise les{' '}
        <LinkTopic text='schémas opérationnels de synthèse' topic={HelpTopic.CC_OSS} />.
      </p>
    </>
  );
}
