import { UserRole } from '@/features/users';

import { type DomIconProps, IconAdmin, IconEditor, IconOwner, IconReader } from '@/components/icons';

export function IconRole({ value, size = '1.25rem', className }: DomIconProps<UserRole>) {
  switch (value) {
    case UserRole.ADMIN:
      return <IconAdmin size={size} className={className ?? 'icon-primary'} />;
    case UserRole.OWNER:
      return <IconOwner size={size} className={className ?? 'icon-primary'} />;
    case UserRole.EDITOR:
      return <IconEditor size={size} className={className ?? 'icon-primary'} />;
    case UserRole.READER:
      return <IconReader size={size} className={className ?? 'icon-primary'} />;
  }
}
