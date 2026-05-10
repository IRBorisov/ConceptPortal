import { useTx } from '@/i18n/use-tx';

import { IconHide, IconImmutable, IconPrivate, IconProtected, IconPublic } from '@/components/icons';

export function HelpAccessEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.access.plural')}</h1>
      <p>Content editing is performed by Editors and the Owner.</p>
      <p>Editing permissions and access settings is performed by the Owner.</p>
      <p>
        Access to content on the Portal may be restricted by the owner of each library object under an{' '}
        <b>access policy</b>.
      </p>
      <ul>
        <li>
          <IconPublic className='inline-icon icon-green' /> a public policy does not restrict read access to the object
        </li>
        <li>
          <IconProtected className='inline-icon icon-blue' /> a protected policy denies access to everyone except the
          object&apos;s editors and owner
        </li>
        <li>
          <IconPrivate className='inline-icon icon-red' /> a private policy leaves access to the object only for the
          owner
        </li>
        <li>
          <IconHide className='inline-icon' /> hiding an object from the library list does not restrict access via a
          direct link
        </li>
        <li>
          <IconImmutable className='inline-icon' /> immutability mode guards against accidental edits
        </li>
      </ul>
    </>
  );
}
