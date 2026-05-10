import { useTx } from '@/i18n';

import { InfoCstClass } from '../../components/info-cst-class';

export function HelpCstClass() {
  const tx = useTx();
  return <InfoCstClass header={tx('tx.cst.class')} />;
}
