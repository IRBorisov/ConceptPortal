'use client';

import clsx from 'clsx';

import { LibraryItemType } from '@/domain/library';
import { useTx } from '@/i18n/use-tx';

import { IconOSS, IconRSForm, IconRSModel } from '@/components/icons';
import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

interface SchemaTitleProps {
  itemType: LibraryItemType;
  title: string;
}

function ItemIcon({ itemType, className }: { itemType: LibraryItemType; className?: string }) {
  switch (itemType) {
    case LibraryItemType.RSFORM:
      return <IconRSForm size='1.5rem' className={className} />;
    case LibraryItemType.OSS:
      return <IconOSS size='1.5rem' className={className} />;
    case LibraryItemType.RSMODEL:
      return <IconRSModel size='1.5rem' className={className} />;
  }
}

export function CurrentTitle({ itemType, title }: SchemaTitleProps) {
  const tx = useTx();
  const setActiveTooltipText = useValueTooltipStore(state => state.setActiveText);

  return (
    <div
      tabIndex={-1}
      className={clsx(
        'cc-fade-in min-w-0 overflow-hidden max-w-fit',
        'flex flex-1 items-center gap-2',
        'text-md text-muted-foreground pointer-events-auto'
      )}
      aria-label={tx('nav.currentItem.titleAria', 'Item title')}
      data-tooltip-id={globalIDs.value_tooltip}
      onPointerEnter={() => setActiveTooltipText(title)}
    >
      <ItemIcon itemType={itemType} className='shrink-0' />
      <span className='pt-0.5 font-medium truncate'>{title}</span>
    </div>
  );
}
