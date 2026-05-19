import { useTx } from '@/i18n';

import {
  IconAxiomFalse,
  IconChild,
  IconConceptBlock,
  IconConsolidation,
  IconCrucial,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstNominal,
  IconCstPredicate,
  IconCstStatement,
  IconCstStructured,
  IconCstTerm,
  IconDownload,
  IconEmptyTerm,
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphOutputs,
  IconNotCalculated,
  IconOSS,
  IconPredecessor,
  IconReference,
  IconRSForm,
  IconRSFormImported,
  IconRSFormOwned,
  IconRSModel,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusProperty,
  IconStatusUnknown,
  IconSynthesis
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpThesaurusEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lang.thesaurus')}</h1>
      <p>
        This section lists the main terms and definitions used on the Portal. Terms are grouped by key entities. More on
        how terms relate appears in other help sections via hyperlinks. Graphical markers (icons and colors) used to
        identify entities visually are also indicated.
      </p>

      <h2>{tx('tx.schema')}</h2>
      <p>
        <IconRSForm className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Conceptual scheme' topic={HelpTopic.CC_SYSTEM} /> (<i>definition system, DS</i>) — the set of
        concepts and assertions together with the relations among them given by definitions.
      </p>
      <p>
        Explication of a DS is presenting the conceptual scheme in a chosen description language (a set of syntactic
        constructs and rules for building definitions).
      </p>
      <p>
        RS explication of a DS is explication using the{' '}
        <LinkTopic text='genera-of-structures apparatus' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        Term graph — a directed graph whose nodes are DS constituents; edges follow when one constituent&apos;s name
        occurs in another&apos;s definition.
      </p>

      <p>
        DS core — base concepts, axioms, and derived concepts needed to state axioms. Remaining constituents form the DS
        body.
      </p>

      <ul>
        DS types relative to OSS operations:
        <li>
          <IconRSForm className='inline-icon' />
          {'\u2009'}Free DS — not tied to an OSS operation.
        </li>
        <li>
          <IconRSFormOwned className='inline-icon' />
          {'\u2009'}Owned DS of this OSS — attached to an operation with the same owner and location as this OSS.
        </li>
        <li>
          <IconRSFormImported className='inline-icon' />
          {'\u2009'}External DS of this OSS — attached to an operation whose owner or location differs from the OSS
          attributes.
        </li>
      </ul>

      <h2>{tx('tx.cst')}</h2>
      <p>
        Constituent — a part of the DS that is either a separate concept, a concept construction pattern, or an
        assertion linking introduced concepts.{' '}
        <LinkTopic text='Constituent attributes' topic={HelpTopic.CC_CONSTITUENTA} /> in RS explication are Term,
        Convention, Typing (Structure), Formal definition, Text definition, Comment.
      </p>
      <p>
        <IconCrucial className='inline-icon' /> A crucial constituent marks substantively important constituents.
        Crucial constituents are highlighted visually and used in filtering.
      </p>

      <br />

      <ul>
        <b>Classification by kind of formal definition</b>
        <li>
          Base concept (<i>undefined concept</i>) has no definition and is fixed by convention and axioms.
        </li>
        <li>
          Derived concept (<i>definable concept</i>) has a formal definition.
        </li>
        <li>An assertion is given by a logical expression.</li>
        <li>A template contains a free parameter in its definition.</li>
      </ul>

      <br />

      <ul>
        <b>Constituent types</b>
        <li>
          <IconCstNominal className='inline-icon' />
          {'\u2009'}Nominal (N#) — a domain entity without a crisp definition, used for associative grouping of
          constituents and preliminary fixation of substantive relations.
        </li>
        <li>
          <IconCstBaseSet className='inline-icon' />
          {'\u2009'}Base set (X#) — undefined concept represented as a set of distinguishable elements.
        </li>
        <li>
          <IconCstConstSet className='inline-icon' />
          {'\u2009'}Constant set (C#) — undefined concept modeled by a set-theory term that supports formal operations
          on its elements.
        </li>
        <li>
          <IconCstStructured className='inline-icon' />
          {'\u2009'}Genus structure (S#) — undefined concept with structure over base and constant sets. Content is
          shaped by the <LinkTopic text='typing relation' topic={HelpTopic.RSL_TYPIFICATION} />, axioms, and convention.
        </li>
        <li>
          <IconCstAxiom className='inline-icon' />
          {'\u2009'}Axiom (A#) — an assertion constraining undefined concepts and derived terms. Every axiom must
          evaluate to true for the scheme to be a theory of the domain.
        </li>
        <li>
          <IconCstTerm className='inline-icon' />
          {'\u2009'}Term (D#) — a derived concept.
        </li>
        <li>
          <IconCstFunction className='inline-icon' />
          {'\u2009'}Term function (F#) — parameterized derived concept with a functional relation between arguments and
          result.
        </li>
        <li>
          <IconCstPredicate className='inline-icon' />
          {'\u2009'}Predicate function (P#) — derived concept acting as a logical expression testing arguments against a
          condition.
        </li>
        <li>
          <IconCstStatement className='inline-icon' />
          {'\u2009'}Statement (T#) — a materially significant assertion that may be true or false depending on
          interpretation of undefined concepts.
        </li>
      </ul>

      <br />

      <ul>
        <b>Relations by occurrence in definitions</b>
        <li>
          <IconGraphOutputs className='inline-icon' />
          {'\u2009'}Consumers — use the constituent in their definitions.
        </li>
        <li>
          <IconGraphInputs className='inline-icon' />
          {'\u2009'}Suppliers — mentioned in this constituent&apos;s definition.
        </li>
        <li>
          <IconGraphExpand className='inline-icon' />
          {'\u2009'}Dependents — consumers, directly or transitively.
        </li>
        <li>
          <IconGraphCollapse className='inline-icon' />
          {'\u2009'}Influencers — suppliers, directly or transitively.
        </li>
      </ul>

      <br />

      <ul>
        <b>Closely related notions</b>
        <li>
          Generating expression — formal definition based on a single external constituent without adding new content.
        </li>
        <li>Base of this concept — the concept the generating expression rests on.</li>
        <li>Generated concept — defined via a generating expression based on another concept.</li>
      </ul>

      <br />

      <ul>
        <b>Definition correctness statuses</b>
        <li>
          <IconStatusUnknown className='inline-icon' />
          {'\u2009'}unchecked — the definition still needs review.
        </li>
        <li>
          <IconStatusOK className='inline-icon' />
          {'\u2009'}correct — the definition checks out.
        </li>
        <li>
          <IconStatusError className='inline-icon' />
          {'\u2009'}erroneous — an error was found.
        </li>
        <li>
          <IconStatusProperty className='inline-icon' />
          {'\u2009'}non-measurable — specifies a non-computable set for which membership can still be tested;
        </li>
        <li>
          <IconStatusIncalculable className='inline-icon' />
          {'\u2009'}incalculable — the definition cannot be interpreted directly;
        </li>
      </ul>

      <br />

      <ul>
        <b>Constituent identification</b>
        <li>Identified constituents — stand in an identification relation.</li>
        <li>Removed — constituent slated for removal.</li>
        <li>Replacing — constituent whose designation replaces the removed one.</li>
      </ul>

      <br />

      <ul>
        <b>Constituent inheritance (within an OSS)</b>
        <li>
          <IconChild className='inline-icon' />
          {'\u2009'}Inherited constituent — obtained from another DS.
        </li>
        <li>
          <IconPredecessor className='inline-icon' />
          {'\u2009'}Own — not inherited.
        </li>
        <li>
          <IconPredecessor className='inline-icon' />
          {'\u2009'}Source — own constituent of which the current one is a direct or indirect descendant.
        </li>
      </ul>

      <h2>{tx('tx.oss')}</h2>
      <p>
        <IconOSS className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Operational synthesis scheme' topic={HelpTopic.CC_OSS} /> (OSS) — a system of operations over
        conceptual schemes.
      </p>
      <p>
        Synthesis graph — a directed graph whose vertices are operations and edges are dependencies on operation
        outputs.
      </p>
      <p>
        <IconConceptBlock className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Conceptual block' topic={HelpTopic.CC_STRUCTURING} /> — a nominally demarcated part of the
        domain that bounds how conceptual schemes in the OSS are attributed to aspects of the domain.
      </p>

      <p>Operation — a distinguished part of the OSS that defines how to obtain a DS within the OSS.</p>
      <p>
        <IconReference className='inline-icon' />
        {'\u2009'}Replica — duplicates the graphical view of some operation&apos;s result to shorten links between
        vertices.
      </p>
      <p>
        <IconConsolidation className='inline-icon' />
        {'\u2009'}Diamond synthesis — an operation using DSs that share ancestors.
      </p>

      <ul>
        <b>Operation types in the OSS</b>
        <li>
          <IconReference className='inline-icon' />
          {'\u2009'}replicating another operation&apos;s result.
        </li>
        <li>
          <IconDownload className='inline-icon' />
          {'\u2009'}loading a DS from the library.
        </li>
        <li>
          <IconSynthesis className='inline-icon' />
          {'\u2009'}synthesizing conceptual schemes.
        </li>
      </ul>

      <h2>{tx('tx.model')}</h2>
      <p>
        <IconRSModel className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Conceptual model' topic={HelpTopic.CC_RSMODEL} /> is an interpretation of a{' '}
        <LinkTopic text='conceptual scheme' topic={HelpTopic.CC_SYSTEM} /> in which interpretable constituents are
        assigned concrete values. It shows how base sets are populated, how structural values are built, and whether
        axioms hold.
      </p>
      <p>
        Interpretation assigns a value to a constituent in the model. For base and constant sets and genus structures,
        interpretation is entered by the user; for axioms, terms, and statements it may be computed from the formal
        definition using values already fixed.
      </p>
      <p>
        <IconAxiomFalse className='inline-icon' />
        {'\u2009'}Violated axiom — an axiom whose interpretation in this model is FALSE. Such a model does not fully
        satisfy the axiom system.
      </p>
      <p>
        <IconNotCalculated className='inline-icon' />
        {'\u2009'}Incalculable constituents — constituents whose expressions drive exponential growth in computational
        resources when evaluated.
      </p>
      <p>
        <IconEmptyTerm className='inline-icon' />
        {'\u2009'}Empty terms — terms whose current value is the empty set. Terms used for control and decision-making
        should not be empty.
      </p>
    </>
  );
}
