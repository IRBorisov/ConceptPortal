'use client';

import { useTx } from '@/i18n';

/** Default empty-state message for {@link DataTable} when no rows are present. */
export function DefaultNoData() {
  const tx = useTx();
  return <div className='p-2 text-center'>{tx('tx.list.empty')}</div>;
}
