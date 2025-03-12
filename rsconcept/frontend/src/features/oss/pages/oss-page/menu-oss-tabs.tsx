'use client';

import { useAuthSuspense } from '@/features/auth';
import { MenuRole } from '@/features/library/components';

import { MenuEditOss } from './menu-edit-oss';
import { MenuMain } from './menu-main';
import { useOssEdit } from './oss-edit-context';

export function MenuOssTabs() {
  const { isOwned, schema } = useOssEdit();
  const { user } = useAuthSuspense();
  return (
    <div className='flex border-r-2'>
      <MenuMain />

      <MenuEditOss />

      <MenuRole isOwned={isOwned} isEditor={!!user.id && schema.editors.includes(user.id)} />
    </div>
  );
}
