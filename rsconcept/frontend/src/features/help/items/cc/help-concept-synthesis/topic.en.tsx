import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptSynthesisEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.synthesis.short')}</h1>
      <p>
        Working with large subject domains requires examining different viewpoints within a single domain, that is,
        forming a series of separate conceptual schemas. At the same time, key concepts for generating solutions require
        combining the expressive capabilities of these schemas.
      </p>

      <p>
        The solution to this problem is the introduction of a formal operation of <b>conceptual schema synthesis</b>.
        The conceptual schema produced by this operation must unite the expressive capabilities of the source schemas
        and contain concepts not expressible in the source schemas individually.
      </p>

      <p>
        Expanding expressive capability is achieved by several means depending on the relationship between the
        synthesised viewpoints:
        <ul>
          <li>
            <b>aspectual synthesis</b> is characterised by identifying common concepts when some undefined concepts are
            shared between two viewpoints;
          </li>
          <li>
            <b>concretising synthesis</b> replaces a weakly constrained undefined concept from one schema with a more
            constrained, concrete base or derived concept from another schema;
          </li>
          <li>
            <b>synthesis through a new relation</b> uses, in addition to the source schemas, an abstract (domain-free)
            schema to connect concepts from two operands by introducing a new undefined concept modelling the
            relationship between the synthesised schemas.
          </li>
        </ul>
      </p>
      <p>
        Combinations of the described approaches within a single synthesis are supported. More detail on the
        implementation of operations in genus-structure form can be found in the{' '}
        <LinkTopic text='Operations section' topic={HelpTopic.RSL_OPERATIONS} />.
      </p>
      <p>
        To manage the aggregate of syntheses,{' '}
        <LinkTopic text='operational synthesis schemas' topic={HelpTopic.CC_OSS} /> are used.
      </p>
    </>
  );
}
