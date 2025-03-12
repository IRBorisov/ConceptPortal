import { type DomIconProps, IconOSS, IconRSForm } from '@/components/icons1';

import { LibraryItemType } from '../backend/types';

/** Icon for library item type. */
export function IconLibraryItemType({ value, size = '1.25rem', className }: DomIconProps<LibraryItemType>) {
  switch (value) {
    case LibraryItemType.RSFORM:
      return <IconRSForm size={size} className={className ?? 'text-sec-600'} />;
    case LibraryItemType.OSS:
      return <IconOSS size={size} className={className ?? 'text-ok-600'} />;
  }
}
