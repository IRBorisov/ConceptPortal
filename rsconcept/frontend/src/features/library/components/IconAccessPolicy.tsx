import { type DomIconProps, IconPrivate, IconProtected, IconPublic } from '@/components/Icons';

import { AccessPolicy } from '../backend/types';

/** Icon for access policy. */
export function IconAccessPolicy({ value, size = '1.25rem', className }: DomIconProps<AccessPolicy>) {
  switch (value) {
    case AccessPolicy.PRIVATE:
      return <IconPrivate size={size} className={className ?? 'text-warn-600'} />;
    case AccessPolicy.PROTECTED:
      return <IconProtected size={size} className={className ?? 'text-sec-600'} />;
    case AccessPolicy.PUBLIC:
      return <IconPublic size={size} className={className ?? 'text-ok-600'} />;
  }
}
