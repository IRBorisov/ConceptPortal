import { useTx } from '@/i18n';

import { InfoCstStatus } from '../../components/info-cst-status';

export function HelpCstStatus() {
  const tx = useTx();
  return <InfoCstStatus title={tx('tx.parse.status')} />;
}
