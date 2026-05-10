import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptSystemEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.hint')}</h1>
      <p>
        This section introduces the <b>system of definitions</b> as a subject of conceptualising subject domains. A
        system of definitions means a collection of individual concepts and assertions, as well as the relationships
        between them, established by the definitions of the concepts.
      </p>

      <p>
        A system of definitions is a tool for studying some object from some viewpoint selected by the problem at hand.
        Such a tool is subject to requirements on <b>expressive capability</b> — the ability to distinguish a set of
        domain entities — and on the absence of ambiguity of interpretation.
      </p>

      <p>
        A conceptual schema is often called a <b>theory of the subject domain</b>, since it allows fixing the system of
        definitions as an axiomatic theory in some formal apparatus. A conceptual model is the combination of a
        conceptual schema and the interpretation functions of its concepts in the subject domain.
      </p>

      <p>
        A system of definitions is built upon <b>undefined concepts</b>, which are given an informal definition called
        a <b>convention</b> — a commonly understood agreement among participants about relating undefined concepts to
        entities or objects in the subject domain. In addition to the convention, a number of assertions relating the
        undefined concepts, called <b>axioms</b>, are often specified.
      </p>

      <p>
        The remaining concepts are given formal definitions using some method of explication that is uniformly
        understood by all participants. The Portal supports{' '}
        <LinkTopic text='explication in genus structures' topic={HelpTopic.RSLANG} />. Additional assertions beyond
        axioms, called <b>theorems</b>, may also be stated. Concepts that receive formal definitions are called{' '}
        <b>derived</b>. It should be noted that in genus-structure explication, axioms also include{' '}
        <LinkTopic text='typification' topic={HelpTopic.RSL_TYPIFICATION} /> relations, and the derived concepts include
        terms, term-functions, and predicate-functions.
      </p>

      <p>
        The <b>core</b> of a conceptual schema is the set of base concepts, axioms, and intermediate derived concepts
        needed to form the expressions of the axioms. The remaining concepts belong to the <b>body</b> of the
        conceptual schema.
      </p>

      <p>
        To achieve the required expressive capability, a conceptual schema identifies "key" concepts that are
        deductively derived from the base concepts through sequential derivation of intermediate concepts. This activity
        is called <b>unfolding</b> the terms (the body of the theory). The formal apparatus employed allows, in
        addition to key concepts, the full variety of concepts to be formed from the bases identified during the
        construction of the key terms. Such constructed varieties can be used to formulate solutions, particularly in
        regulatory contexts.
      </p>

      <p>
        The various relationships between concepts and methods for constructing systems of definitions are explored in
        more detail in the <LinkTopic text='Concept Relations' topic={HelpTopic.CC_RELATIONS} /> section.
      </p>
    </>
  );
}
