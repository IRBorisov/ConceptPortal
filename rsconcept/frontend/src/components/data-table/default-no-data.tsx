'use client';

import { useTx } from '@/i18n';

export function DefaultNoData() {
  const tx = useTx();
  return <div className='p-2 text-center'>{tx('ui.dataTable.noData', 'No data')}</div>;
}
