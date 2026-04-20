'use client';

import { useAuth } from '@/features/auth';
import { MenuRole } from '@/features/library/components/menu-role';
import { MenuEditSchema } from '@/features/rsform/pages/rsform-page/menu-edit-schema';

import { MenuMain } from './menu-main';
import { useModelEdit } from './model-edit-context';

export function MenuModel() {
  const { user } = useAuth();
  const { isOwned, model } = useModelEdit();

  return (
    <div className='flex border-r-2'>
      <MenuMain />
      <MenuEditSchema />
      <MenuRole isOwned={isOwned} isEditor={!!user.id && model.editors.includes(user.id)} />
    </div>
  );
}
