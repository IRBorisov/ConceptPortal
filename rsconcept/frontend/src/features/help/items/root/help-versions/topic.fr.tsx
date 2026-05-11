import { useTx } from '@/i18n/use-tx';

import { IconEditor, IconNewVersion, IconShare, IconUpload, IconVersions } from '@/components/icons';

export function HelpVersionsFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.versioning')}</h1>
      <p>
        Le versionnement est disponible pour les <IconEditor size='1rem' className='inline-icon' /> éditeurs.
      </p>
      <p>
        Le versionnement enregistre l&apos;état actuel du schéma sous un nom déterminé (version) avec accès par lien.
      </p>
      <p>Après création, le contenu d&apos;une version ne peut plus être modifié.</p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconShare className='inline-icon' /> Partager inclut la version dans le lien
        </li>
        <li>
          <IconUpload className='inline-icon icon-red' /> Charger une version dans le schéma actuel
        </li>
        <li>
          <IconNewVersion className='inline-icon icon-green' /> Une version ne peut être créée qu&apos;à partir du
          schéma actuel
        </li>

        <li>
          <IconVersions className='inline-icon' /> Modifier les attributs des versions
        </li>
      </ul>
    </>
  );
}
