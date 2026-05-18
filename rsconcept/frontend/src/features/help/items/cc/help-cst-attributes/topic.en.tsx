import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpCstAttributesEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.cst.attribute.plural')}</h1>
      <p>
        <b>Term</b> can be assigned to any constituent. It is used in other Terms and in Textual definitions.
      </p>
      <p>
        <b>Formal definition</b> is built using the formal apparatus of{' '}
        <LinkTopic text='genus-structure explication' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        <b>Typification</b> is computed automatically based on the Formal definition and reflects the structure of the
        elements of the set defined by that definition. It can also be entered manually for constituents whose
        definition has not yet been entered.
      </p>
      <p>
        <b>Textual definition</b> is provided for constituents that have a Formal definition or a Domain. It is a
        textual interpretation of the formal definition and is constructed from linking words, set-theory terms, and
        references to terms of previously introduced constituents.
      </p>
      <p>
        <b>Convention</b> is an agreement on correlating an undefined concept with entities in the subject domain.
      </p>
      <p>
        <b>Comment</b> can be added to any derived concept to store additional information.
      </p>

      <h2>Undefined concepts</h2>
      <p>
        <code>X1, C1</code> — Basis sets and Constant sets have no complex structure and are defined by Convention.
        Elements of Constant sets participate in arithmetic operations and ordinal predicates alongside set
        cardinalities.
      </p>
      <p>
        <code>S1 :∈ ℬ(X1)</code> — Genus structures are defined by a Domain, Convention, and a set of Axioms, along with
        a Term. According to the Convention, elements of the genus structure are populated from the Domain such that the
        Axioms are satisfied. A genus structure may be a set, an element, or a tuple.
      </p>
      <p>
        <code>A1 :== ∀(α,β)∈S1 (β,α)∈S1</code> — Axioms are defined by a logical Formal definition and, if necessary, a
        Convention.
      </p>
      <h2>Derived concepts</h2>
      <p>
        <code>D1 :== Pr1(S1)</code> — Terms are defined by a typed Formal definition.
      </p>
      <p>
        <code>T1 :== Pr1(S1)=Pr2(S1)</code> — Statements are defined by a logical Formal definition.
      </p>
      <p>
        <code>F1 :== [σ∈ℬ(X1×X1)] Pr1(σ)\Pr2(σ)</code>
        <br />
        Term-functions are defined by a parameterised typed Formal definition.
      </p>
      <p>
        <code>P1 :== [σ∈ℬ(X1×X1)] card(Pr1(σ)) = card(σ)</code>
        <br />
        Predicate-functions are defined by a parameterised logical Formal definition.
      </p>
    </>
  );
}
