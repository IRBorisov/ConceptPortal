'use client';

import { useAuth } from '@/features/auth';
import { MenuRole } from '@/features/library/components/menu-role';

import { MenuEditSchema } from './menu-edit-schema';
import { MenuMain } from './menu-main';
import { useSchemaEdit } from './schema-edit-context';

export function MenuGroupSchema() {
  const { user } = useAuth();
  const { schema, isOwned } = useSchemaEdit();

  return (
    <div className='flex border-r-2'>
      <MenuMain />
      <MenuEditSchema />
      <MenuRole isOwned={isOwned} isEditor={!!user.id && schema.editors.includes(user.id)} />
    </div>
  );
}
