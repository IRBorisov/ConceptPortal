import clsx from 'clsx';

import { LibraryItemType } from '@/features/library';

import { IconOSS, IconRSForm, IconRSModel } from '@/components/icons';
import { globalIDs } from '@/utils/constants';

interface SchemaTitleProps {
  itemType: LibraryItemType;
  title: string;
}

function ItemIcon({ itemType }: { itemType: LibraryItemType; }) {
  switch (itemType) {
    case LibraryItemType.RSFORM:
      return <IconRSForm size='1.5rem' />;
    case LibraryItemType.OSS:
      return <IconOSS size='1.5rem' />;
    case LibraryItemType.RSMODEL:
      return <IconRSModel size='1.5rem' />;
  }
}

export function CurrentTitle({ itemType, title }: SchemaTitleProps) {
  return (
    <div
      tabIndex={-1}
      className={clsx(
        'cc-fade-in min-w-0 overflow-hidden max-w-fit',
        'flex flex-1 items-center gap-2',
        'text-md text-muted-foreground pointer-events-auto'
      )}
      aria-label='Название схемы'
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-content={title}
    >
      <ItemIcon itemType={itemType} />
      <span className='pt-0.5 font-medium truncate'>{title}</span>
    </div>
  );
}
