import { type DomIconProps, IconPrivate, IconProtected, IconPublic } from '@/components/icons';

import { AccessPolicy } from '../backend/types';

/** Icon for access policy. */
export function IconAccessPolicy({ value, size = '1.25rem', className }: DomIconProps<AccessPolicy>) {
  switch (value) {
    case AccessPolicy.PRIVATE:
      return <IconPrivate size={size} className={className ?? 'text-destructive'} />;
    case AccessPolicy.PROTECTED:
      return <IconProtected size={size} className={className ?? 'text-primary'} />;
    case AccessPolicy.PUBLIC:
      return <IconPublic size={size} className={className ?? 'text-constructive'} />;
  }
}
