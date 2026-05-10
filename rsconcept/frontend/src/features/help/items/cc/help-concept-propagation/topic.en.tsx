import { useTx } from '@/i18n';

import { IconPredecessor } from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptPropagationEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.change.propagation')}</h1>
      <p>
        The Portal supports <b>propagated changes</b> within an <LinkTopic text='OSS' topic={HelpTopic.CC_OSS} />.
        Changes made to source conceptual schemas are automatically propagated through the synthesis graph (by updating
        inherited constituents). The formal definitions and conventions of inherited constituents can only be edited by
        modifying{' '}
        <span className='text-nowrap'>
          <IconPredecessor className='inline-icon' /> <b>the source constituents</b>.
        </span>
      </p>
      <p>
        Changes at the conceptual schema level (adding, deleting, or modifying constituents) lead to the automatic
        creation, deletion, or update of inherited constituents. If deleted constituents are present in the
        identification table of any operation, such identifications{' '}
        <u>will be automatically cancelled</u>.
      </p>
      <p>
        After a cancellation, references to the re-created constituent in the own constituents of the synthesised schema
        are not updated.
      </p>
      <p>
        Deleting a conceptual schema bound to an operation causes the automatic deletion of all inherited constituents.
        It is possible to subsequently re-execute the load operation as well as re-perform the synthesis. However,
        manually added constituents and cancelled identifications <u>will not be restored</u>.
      </p>
      <p>
        When the arguments of a synthesis operation are changed and a bound schema exists, the corresponding constituents
        of the arguments are automatically added or removed. Identification tables are adjusted accordingly so as not to
        reference deleted constituents.
      </p>
      <p>
        Deleting a Load operation is possible without restrictions. A Synthesis operation can be deleted only when it is
        not an argument of another operation. When deleting an operation, you can select the option "delete schema" to
        remove the conceptual schema from the Portal database. You can also select "keep constituents", which turns
        inherited constituents in operations below in the graph into source constituents.
      </p>
    </>
  );
}
