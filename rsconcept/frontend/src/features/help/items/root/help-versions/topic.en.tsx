import { useTx } from '@/i18n/use-tx';

import { IconEditor, IconNewVersion, IconShare, IconUpload, IconVersions } from '@/components/icons';

export function HelpVersionsEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.versioning')}</h1>
      <p>
        Versioning is available to <IconEditor size='1rem' className='inline-icon' /> Editors.
      </p>
      <p>Versioning saves the current state of a scheme under a specific name (version) with link-based access.</p>
      <p>Once a version is created, its content cannot be changed.</p>

      <h2>Actions</h2>
      <ul>
        <li>
          <IconShare className='inline-icon' /> Share embeds the version in the URL
        </li>
        <li>
          <IconUpload className='inline-icon icon-red' /> Upload a version into the current scheme
        </li>
        <li>
          <IconNewVersion className='inline-icon icon-green' /> You can create a version only from the current scheme
        </li>

        <li>
          <IconVersions className='inline-icon' /> Edit version metadata
        </li>
      </ul>
    </>
  );
}
