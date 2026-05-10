import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangCorrectFr() {
  const tx = useTx();
  return (
    <>
      <h1>
        {tx('tx.concept.system.portability')} & {tx('tx.concept.system.correctness')}
      </h1>
      <p>
        <b>La portabilité bijective des expressions</b> signifie l'indépendance des valeurs de définition vis-à-vis du
        remplacement bijectif des interprétations des concepts indéfinis. Elle est basée sur l'incomparabilité
        fondamentale des éléments des ensembles de base.
      </p>
      <p>
        La vérification des expressions contenant des identifiants globaux est effectuée dans le contexte global donné
        (les typifications et la portabilité bijective sont connues, ainsi que les informations sur les arguments des
        fonctions). Tous les identifiants inconnus sont considérés comme incorrects.
      </p>
      <p>
        Les règles de vérification des expressions ensemblistes découlent de la condition de portabilité bijective du
        prédicat d'appartenance — un élément doit correspondre à l'ensemble pour lequel l'appartenance est vérifiée.
        Une condition nécessaire pour la portabilité bijective est la satisfaction de la{' '}
        <LinkTopic text='relation de typification' topic={HelpTopic.RSL_TYPIFICATION} /> pour tous les identifiants
        locaux et globaux.
      </p>
      <p>
        La correction logique (cohérence) des expressions ne peut en général pas être vérifiée automatiquement.
        Cependant, l'existence d'un exemple d'interprétation sur des objets du domaine d'application constitue un
        fondement pour affirmer la cohérence des axiomes imposés.
      </p>
      <p>
        L'éditeur d'expressions du Portail est équipé d'outils de vérification des expressions et de calcul de leur
        typification. Les erreurs trouvées sont diagnostiquées et un message d'erreur correspondant est affiché.
      </p>
    </>
  );
}
