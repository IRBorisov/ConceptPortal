import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

import { Subtopics } from '../../../components/subtopics';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.framework')}</h1>
      <p>
        Les domaines complexes exigent des approches particulières pour les comprendre et les décrire.{' '}
        <b>L&apos;approche systémique</b> consiste à fixer la frontière du système, isoler des sous-systèmes et établir des
        liens entre eux. Les sous-systèmes sont décrits séparément, puis leurs descriptions sont synthétisées en tenant
        compte des liens retenus. On obtient ainsi une description d&apos;ensemble à partir des descriptions des parties.
      </p>
      <p>
        La <b>conceptualisation</b> est la construction déductive de schémas conceptuels (systèmes de définitions) qui
        expriment les relations de fond de chaque sous-système. Les schémas peuvent être synthétisés pour former un
        système de définitions commun dans le domaine retenu.
      </p>
      <p>
        La conceptualisation s&apos;exerce dans le cadre d&apos;une tâche posée dans le domaine. Le problème appliqué
        fixe l&apos;étendue de la conceptualisation et la répartition raisonnable des moyens. Le résultat est un objet
        de pilotage pour lequel on peut élaborer des décisions qui réalisent la tâche.
      </p>
      <p>
        En répétant conceptualisation et résolution de problèmes avec les schémas ainsi construits, on développe une
        compétence de <b>pensée conceptuelle</b> : un mode de pensée où l&apos;on contrôle strictement définitions et
        hypothèses dans lesquelles s&apos;inscrit le contenu du domaine.
      </p>

      <p>
        La conceptualisation est exposée plus en détail dans le{' '}
        <TextURL text='recueil de cours de Z. A. Koutcharov' href={external_urls.zak_lectures} />
        <br />
        Méthodes d&apos;analyse et de synthèse conceptuelles dans la recherche théorique et la conception de systèmes
        socio-économiques : manuel / Z. A. Koutcharov. — M. : Kontsept, 2008. — 3e éd. revue et corrigée.
      </p>

      <Subtopics headTopic={HelpTopic.CONCEPTUAL} />
    </>
  );
}
