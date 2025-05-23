import { type DomIconProps, IconBusiness, IconPublic, IconTemplates, IconUser } from '@/components/icons';

import { LocationHead } from '../models/library';

/** Icon for location. */
export function IconLocationHead({ value, size = '1.25rem', className }: DomIconProps<string>) {
  switch (value.substring(0, 2) as LocationHead) {
    case LocationHead.COMMON:
      return <IconPublic size={size} className={className ?? 'text-primary'} />;
    case LocationHead.LIBRARY:
      return <IconTemplates size={size} className={className ?? 'text-destructive'} />;
    case LocationHead.PROJECTS:
      return <IconBusiness size={size} className={className ?? 'text-primary'} />;
    case LocationHead.USER:
      return <IconUser size={size} className={className ?? 'text-constructive'} />;
  }
}
