import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangInterpretFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.system.evaluability')}</h1>
      <p>
        L'application pratique des schémas conceptuels repose sur l'<b>interprétation</b> — la mise en correspondance
        du contenu du domaine avec les termes et définitions du schéma. À cet effet, conformément aux{' '}
        <LinkTopic text='conventions' topic={HelpTopic.CC_CONSTITUENTA} />, des listes d'objets du domaine
        correspondant aux concepts indéfinis sont introduites. La correction des relations de{' '}
        <LinkTopic text='typification' topic={HelpTopic.RSL_TYPIFICATION} /> pour les structures de genres est assurée.
      </p>
      <p>
        L'interprétation des concepts dérivés peut être spécifiée par des méthodes externes ou calculée automatiquement
        à l'aide des définitions formelles. Toute expression impliquant l'énumération d'éléments d'ensembles ne peut
        pas être calculée dans un délai raisonnable. Par exemple, l'interprétation de l'assertion{' '}
        {'"∀α∈Z α>0"'} nécessite l'énumération de l'ensemble infini des entiers.
      </p>
      <p>
        Les expressions <b>interprétables</b> sont celles qui peuvent être calculées en temps polynomial par rapport
        aux cardinalités des interprétations des identifiants globaux utilisés dans cette expression. Par analogie avec
        la <LinkTopic text='portabilité bijective' topic={HelpTopic.RSL_CORRECT} />, les conditions
        d'interprétabilité peuvent être dérivées de l'énoncé « les expressions <code>Z, ℬ(α)</code> ne sont pas
        interprétables ».
      </p>
      <p>
        Une catégorie d'expressions est également introduite, définissant des ensembles pour lesquels l'appartenance
        peut être vérifiée en temps polynomial, mais la liste complète des éléments ne peut pas être calculée.
        <br />
        Par exemple, <code>{'D{ξ∈ℬ(X1×X1) | Pr1(ξ)=Pr2(ξ)}'}</code>.
      </p>
      <p>
        Les constituants dont les expressions satisfont cette propriété sont appelés <b>Adimensionnels</b>. Ils peuvent
        être utilisés dans des expressions interprétables uniquement dans des constructions qui ne nécessitent pas
        l'énumération de leurs éléments.
      </p>
      <p>
        Les constituants dont les expressions ne permettent pas de vérifier l'appartenance en temps polynomial sont
        appelés <b>Incalculables</b>.
      </p>
    </>
  );
}
