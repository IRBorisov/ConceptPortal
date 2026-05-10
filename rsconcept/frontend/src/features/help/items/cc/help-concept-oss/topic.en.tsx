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
        A synthesis operation within an OSS is defined by a set of argument operations and an <b>identification table</b>{' '}
        of concepts from the CSs bound to the selected arguments. In this way{' '}
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
    </>
  );
}
