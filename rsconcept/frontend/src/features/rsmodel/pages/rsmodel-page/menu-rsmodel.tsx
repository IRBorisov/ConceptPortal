'use client';

import { useAuth } from '@/features/auth';
import { MenuRole } from '@/features/library/components/menu-role';
import { MenuEditSchema } from '@/features/rsform/pages/rsform-page/menu-edit-schema';

import { MenuMain } from './menu-main';
import { useRSModelEdit } from './rsmodel-context';

export function MenuRSModel() {
  const { user } = useAuth();
  const { isOwned, model } = useRSModelEdit();

  return (
    <div className='flex border-r-2'>
      <MenuMain />
      <MenuEditSchema />
      <MenuRole isOwned={isOwned} isEditor={!!user.id && model.editors.includes(user.id)} />
    </div>
  );
}
