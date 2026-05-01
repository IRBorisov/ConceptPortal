'use client';

import { useTx } from '@/app/i18n/use-tx';

export function DefaultNoData() {
  const tx = useTx();
  return <div className='p-2 text-center'>{tx('ui.dataTable.noData', 'No data')}</div>;
}
