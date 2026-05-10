import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangInterpretEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.system.evaluability')}</h1>
      <p>
        The practical application of conceptual schemas is based on <b>interpretation</b> — correlating domain content
        with schema terms and definitions. For this purpose, in accordance with{' '}
        <LinkTopic text='conventions' topic={HelpTopic.CC_CONSTITUENTA} />, lists of domain objects corresponding to
        undefined concepts are introduced. The correctness of{' '}
        <LinkTopic text='typification' topic={HelpTopic.RSL_TYPIFICATION} /> relations for genus structures is ensured.
      </p>
      <p>
        The interpretation of derived concepts can be specified by external methods or automatically computed using
        formal definitions. Not every expression involving enumeration of set elements can be computed in a reasonable
        time. For example, interpreting the assertion {'"∀α∈Z α>0"'} requires enumerating the infinite set of
        integers.
      </p>
      <p>
        <b>Interpretable</b> are expressions that can be computed in polynomial time relative to the cardinalities of
        the interpretations of the global identifiers used in that expression. By analogy with{' '}
        <LinkTopic text='bijective portability' topic={HelpTopic.RSL_CORRECT} />, the conditions for interpretability
        can be derived from the statement "expressions <code>Z, ℬ(α)</code> are not interpretable".
      </p>
      <p>
        A category of expressions is also introduced that define sets for which membership can be checked in polynomial
        time, but the full list of elements cannot be computed.
        <br />
        For example, <code>{'D{ξ∈ℬ(X1×X1) | Pr1(ξ)=Pr2(ξ)}'}</code>.
      </p>
      <p>
        Constituents whose expressions satisfy this property are called <b>Dimensionless</b>. They can be used in
        interpretable expressions only in constructs that do not require enumeration of their elements.
      </p>
      <p>
        Constituents whose expressions do not allow checking membership in polynomial time are called{' '}
        <b>Incomputable</b>.
      </p>
    </>
  );
}
