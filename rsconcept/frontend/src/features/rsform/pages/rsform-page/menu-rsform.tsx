'use client';

import { useAuth } from '@/features/auth';
import { MenuRole } from '@/features/library/components/menu-role';

import { MenuEditSchema } from './menu-edit-schema';
import { MenuMain } from './menu-main';
import { useRSFormEdit } from './rsedit-context';

export function MenuRSForm() {
  const { user } = useAuth();
  const { schema, isOwned } = useRSFormEdit();

  return (
    <div className='flex border-r-2'>
      <MenuMain />
      <MenuEditSchema />
      <MenuRole isOwned={isOwned} isEditor={!!user.id && schema.editors.includes(user.id)} />
    </div>
  );
}
