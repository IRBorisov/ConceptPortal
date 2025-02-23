'use client';

import { useAuthSuspense } from '@/features/auth';
import { MenuRole } from '@/features/library';

import { MenuEditOss } from './MenuEditOss';
import { MenuMain } from './MenuMain';
import { useOssEdit } from './OssEditContext';

export function MenuOssTabs() {
  const { isOwned, schema } = useOssEdit();
  const { user } = useAuthSuspense();
  return (
    <div className='flex  border-r-2'>
      <MenuMain />

      <MenuEditOss />

      <MenuRole isOwned={isOwned} isEditor={!!user.id && schema.editors.includes(user.id)} />
    </div>
  );
}
