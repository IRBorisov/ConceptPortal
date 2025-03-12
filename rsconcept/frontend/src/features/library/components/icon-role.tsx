import { UserRole } from '@/features/users';

import { IconAdmin, IconEditor, IconOwner, IconReader } from '@/components/icons';

interface IconRoleProps {
  role: UserRole;
  size?: string;
}

export function IconRole({ role, size = '1.25rem' }: IconRoleProps) {
  switch (role) {
    case UserRole.ADMIN:
      return <IconAdmin size={size} className='icon-primary' />;
    case UserRole.OWNER:
      return <IconOwner size={size} className='icon-primary' />;
    case UserRole.EDITOR:
      return <IconEditor size={size} className='icon-primary' />;
    case UserRole.READER:
      return <IconReader size={size} className='icon-primary' />;
  }
}
