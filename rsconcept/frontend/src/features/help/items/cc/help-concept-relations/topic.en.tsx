import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelationsEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.relation.plural')}</h1>
      <p>
        The most general relationship between constituents is the association established between a nominoid and other
        constituents attributed to it. Such a relationship is set before precise definitions are formulated and is used
        to preliminarily fix groups of related constituents.
      </p>
      <p>
        Constituents are also related to each other through the use of some constituents in the definition of others.
        This relationship is generally called <b>used in definition</b>. It forms the basis for constructing the{' '}
        <b>Term Graph</b>, which displays the sequence of concept derivation in the conceptual schema.
      </p>

      <p>
        If a formal expression uses only basic structural formulas, such a definition is called "simple" or "strictly
        formal". That is, to construct such definitions it is sufficient to formally apply language constructs; no new
        conventions about domain content are required.
      </p>
      <p>
        This way of constructing definitions is called <b>formal unfolding</b> and is often used to describe
        complex-structured concepts and to generate{' '}
        <LinkTopic text='varieties' topic={HelpTopic.CC_SYSTEM} />.
      </p>
      <p>
        If a concept is defined using only one other concept via a simple definition, it is called <b>derived</b>, and
        the source concept is called its <b>basis</b>.
      </p>
      <p>
        Another method of definition is called substantive (deductive) unfolding. It employs more complex constructs
        that involve enumeration of objects and checking their properties using logical conditions. In genus-structure
        explication such constructs include quantifier assertion expressions, declarative, imperative, and recursive
        definitions.
      </p>
      <p>
        The <b>genus–species relation</b> between concepts is formalised through a definition in which the elements of a
        set corresponding to the genus concept are filtered by a condition to form the elements of the species concept.
      </p>
    </>
  );
}
