import { useTx } from '@/i18n';

import {
  IconGenerateNames,
  IconGenerateStructure,
  IconInlineSynthesis,
  IconReplace,
  IconSortList,
  IconTemplates
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangOperationsEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.operation.hint')}</h1>
      <p>This section explains the various operations on conceptual schemas.</p>

      <h2>
        <IconSortList size='1.25rem' className='inline-icon' /> {tx('tx.schema.order.restore.short')}
      </h2>
      <ul>
        Ordering the constituent list by the following rules:
        <li>basis and constant sets are declared first</li>
        <li>
          constituents of the <LinkTopic text='Core' topic={HelpTopic.CC_SYSTEM} /> are placed before the rest
        </li>
        <li>
          <b>topological order</b>: derivation dependencies flow from earlier to later declarations
        </li>
        <li>
          <LinkTopic text='derived' topic={HelpTopic.CC_RELATIONS} /> constituents immediately follow their source
        </li>
        <li>maximum preservation of original order subject to the above rules</li>
      </ul>

      <h2>
        <IconGenerateNames size='1.25rem' className='inline-icon' /> {tx('tx.schema.order.rename')}
      </h2>
      <p>
        Generating constituent names such that the index order matches the declaration order in the list. For example,{' '}
        <code>{'Rename({X4, X2, D1, D3}) = {X1, X2, D1, D2}'}</code>.
      </p>

      <h2>
        <IconGenerateStructure size='1.25rem' className='inline-icon' /> {tx('tx.concept.expandStructure.noun')}
      </h2>
      <p>
        Generating the complete set of terms that unfold the structure of the selected constituent. The operation is
        applicable to terms, genus structures, and term-functions with{' '}
        <LinkTopic text='typification' topic={HelpTopic.RSL_TYPIFICATION} /> of set or tuple.
        <br />
        <code>{'Generate(S1∈ℬ(X1×ℬ(X1))) = {Pr1(S1), Pr2(S1), red(Pr2(S1))}'}</code>
      </p>

      <h2>
        <IconReplace size='1.25rem' className='inline-icon' /> {tx('tx.substitution')}
      </h2>
      <p>
        Building an identification table and applying it to the current schema. As a result, a number of constituents
        are removed and their occurrences are replaced by others.
      </p>

      <h2>
        <IconTemplates size='1.25rem' className='inline-icon' /> Generate from template
      </h2>
      <p>
        This operation allows inserting a constituent from an{' '}
        <LinkTopic text='expression template' topic={HelpTopic.RSL_TEMPLATES} />.
      </p>

      <h2>
        <IconInlineSynthesis size='1.25rem' className='inline-icon' /> {tx('tx.schema.embed')}
      </h2>
      <p>
        Implementation of the conceptual schema synthesis operation within a single conceptual schema. The operation
        consists of copying a selected subset of constituents from the source schema into the current schema. An
        identification table is also specified to link the added constituents with the current schema.
      </p>
    </>
  );
}
