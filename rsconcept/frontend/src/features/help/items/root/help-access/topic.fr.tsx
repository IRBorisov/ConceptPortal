import { useTx } from '@/i18n/use-tx';

import { IconHide, IconImmutable, IconPrivate, IconProtected, IconPublic } from '@/components/icons';

export function HelpAccessFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.access.plural')}</h1>
      <p>La modification du contenu est assurée par les éditeurs et le propriétaire.</p>
      <p>La modification des droits et des accès est assurée par le propriétaire.</p>
      <p>
        L&apos;accès au contenu sur le portail peut être restreint par le propriétaire de chaque objet de bibliothèque
        dans le cadre d&apos;une <b>politique d&apos;accès</b>.
      </p>
      <ul>
        <li>
          <IconPublic className='inline-icon icon-green' /> une politique publique ne limite pas la lecture de l&apos;objet
        </li>
        <li>
          <IconProtected className='inline-icon icon-blue' /> une politique protégée interdit l&apos;accès à tous sauf
          aux éditeurs et au propriétaire de l&apos;objet
        </li>
        <li>
          <IconPrivate className='inline-icon icon-red' /> une politique personnelle réserve l&apos;accès à l&apos;objet
          au seul propriétaire
        </li>
        <li>
          <IconHide className='inline-icon' /> masquer l&apos;objet dans la liste de la bibliothèque ne limite pas
          l&apos;accès par lien direct
        </li>
        <li>
          <IconImmutable className='inline-icon' /> le mode immuable protège contre les modifications accidentelles
        </li>
      </ul>
    </>
  );
}
