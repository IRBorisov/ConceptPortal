import { type DomIconProps, IconOSS, IconRSForm } from '@/components/icons';

import { LibraryItemType } from '../backend/types';

/** Icon for library item type. */
export function IconLibraryItemType({ value, size = '1.25rem', className }: DomIconProps<LibraryItemType>) {
  switch (value) {
    case LibraryItemType.RSFORM:
      return <IconRSForm size={size} className={className ?? 'text-primary'} />;
    case LibraryItemType.OSS:
      return <IconOSS size={size} className={className ?? 'text-constructive'} />;
  }
}
