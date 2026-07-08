import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRSModelEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model')}</h1>
      <p>
        A <b>conceptual model</b> combines a <LinkTopic text='conceptual schema' topic={HelpTopic.CC_SYSTEM} /> with an{' '}
        <em>interpretation</em> of its concepts in the subject domain. Theoretically it is a pair (schema,
        interpretation): the schema defines the signature and definitions, the model assigns finite carriers (sets,
        structured data) to base concepts and fixes which objects count as values of terms and which formulas are true
        in a given situation. Derived concepts are not specified separately: their values are computed from schema
        definitions under the chosen interpretation of base concepts.
      </p>

      <p>
        The conceptual schema answers the question "what is defined and how", while the model answers "what values do
        these concepts take right now". Together they allow checking data consistency with definitions, running
        experiments with expressions, and automatically recomputing values along the dependency graph between
        constituents.
      </p>

      <h2>How the model works</h2>
      <p>
        The model stores the current value of each constituent as structured data (numbers, tuples, finite sets —
        ordered collections of elements). Basis sets are lists of elements. Genus structures are populated from these
        elements. Values of other concepts are computed from definitions in topological dependency order when required.
        Functional constituents act as subroutines: on call a local argument context is created and the body is
        evaluated in the same way as any formula.
      </p>
      <p>
        Expressions in RSLang are evaluated by traversing the syntax tree: global names are taken from the model
        context, quantifiers and iteration constructs enumerate elements of already-built finite sets, recursive
        definitions are processed iteratively until convergence. The{' '}
        <LinkTopic text='expression evaluation tab' topic={HelpTopic.UI_MODEL_EVALUATOR} /> allows checking any formula
        in the current model context.
      </p>

      <h2>Computation limitations</h2>
      <p>
        A <em>finite</em> semantics is used: all in-memory sets are finite and explicitly enumerated. Infinite domains
        (e.g. the set of all integers) are not supported. Deep nesting of iterations or recursion, as well as large
        Cartesian products, increase the number of steps; if the limit is exceeded, computation is aborted with an
        error. If the product of factor cardinalities is too large, the Cartesian product is not constructed.
      </p>
      <p>
        The boolean operator (<code className='text-sm'>B(X)</code>, the power set of X) theoretically yields 2
        <sup>|X|</sup> elements. In the system it is <em>fully materialised</em>: all subsets are enumerated and stored.
        Even for moderate X this grows exponentially in memory and time; with nested booleans the growth is even faster.
        Therefore a strict limit is imposed on the cardinality of the boolean argument: if X is too large, constructing{' '}
        <code className='text-sm'>B(X)</code> is rejected and the expression must be rewritten.
      </p>
      <p>Conclusion: the model is used for executable verification of definitions on real finite data.</p>
    </>
  );
}
