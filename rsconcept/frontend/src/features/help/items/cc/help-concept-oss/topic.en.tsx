import { useTx } from '@/i18n';

import {
  IconConsolidation,
  IconDownload,
  IconExecute,
  IconOSS,
  IconRSFormImported,
  IconRSFormOwned,
  IconSynthesis
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptOSSEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss')}</h1>
      <p>
        Working with complex subject domains requires repeated{' '}
        <LinkTopic text='synthesis' topic={HelpTopic.CC_SYNTHESIS} /> to construct target concepts. The sequence of
        syntheses is specified using an{' '}
        <span className='text-nowrap'>
          <IconOSS className='inline-icon' /> <b>Operational Synthesis Schema (OSS)</b>
        </span>{' '}
        and is displayed as a <LinkTopic text='Synthesis Graph' topic={HelpTopic.UI_OSS_GRAPH} />.
      </p>
      <p>
        The basic OSS operations are <IconDownload size='1rem' className='inline-icon' /> load and{' '}
        <IconSynthesis size='1rem' className='inline-icon' /> synthesis. A schema can be loaded from another location{' '}
        <span className='text-nowrap'>
          (<IconRSFormImported size='1rem' className='inline-icon' />
          <b>external CS</b>)
        </span>{' '}
        or created within the OSS{' '}
        <span className='text-nowrap'>
          (<IconRSFormOwned size='1rem' className='inline-icon' />
          <b>own CS</b>)
        </span>
        . Loading schemas produced by synthesis in other OSSs is not permitted. Also, repeated loading of the same CS
        within a single OSS is prohibited.
      </p>
      <p>
        When the location or owner of the OSS changes, the corresponding attributes of own CSs change accordingly. When
        an OSS is deleted, all own CSs are deleted as well. When an operation is deleted, the own CS is detached from
        the OSS and becomes a free CS.
      </p>
      <p>
        A synthesis operation within an OSS is defined by a set of argument operations and an{' '}
        <b>identification table</b> of concepts from the CSs bound to the selected arguments. In this way{' '}
        <LinkTopic text='constituents' topic={HelpTopic.CC_CONSTITUENTA} /> in each CS are divided into source and
        inherited. When building the identification table, users are prompted to synthesise derived concepts whose
        expressions match after the specified identifications are applied.
      </p>
      <p>
        After specifying arguments and the identification table, you need to{' '}
        <span className='text-nowrap'>
          <IconExecute className='inline-icon icon-green' /> activate the Synthesis
        </span>{' '}
        once to execute the operation and enable{' '}
        <LinkTopic text='propagated changes' topic={HelpTopic.CC_PROPAGATION} />.
      </p>
      <p>
        <span className='text-nowrap'>
          <IconConsolidation className='inline-icon' /> <b>Diamond synthesis</b>
        </span>{' '}
        refers to an operation where CSs sharing common ancestors are used. Such synthesis may produce duplicates and
        ambiguities. The identification table must be carefully constructed by adding duplicate concepts from the
        synthesised schemas.
      </p>
      <h2 id='relativization'>Relativization</h2>
      <p>
        Relativization builds one new conceptual schema from one source schema. The selected base set or structure
        specifies the allowed contexts. The resulting schema describes a family of values and relations indexed by those
        contexts. For example, a family of sets <code>A(c)</code> is represented by a relation of pairs{' '}
        <code>(c, a)</code> with <code>a</code> in <code>A(c)</code>.
      </p>
      <p>
        Context-dependent term functions and predicates receive a parameter whose domain is the context structure. Where
        needed, a helper term function retrieves the unique value associated with a given context.
      </p>
      <p>
        Exclusions are kernel constituents that should have no direct context parameter. These constituents remain in
        the result. Expressions of dependent constituents are transformed according to their dependencies.
      </p>
      <p>
        In the <LinkTopic text='OSS graph' topic={HelpTopic.UI_OSS_GRAPH} />, choose “Add…” → “Relativization”. Select
        the source. In “{tx('tx.oss.relativization.target.field')}”, choose a base set or structure and mark any
        exclusions. Review the proposed title, enter a short name, and click “Create”. The source, result, and operation
        parameters appear in the <LinkTopic text='OSS passport' topic={HelpTopic.UI_OSS_CARD} />.
      </p>
    </>
  );
}
