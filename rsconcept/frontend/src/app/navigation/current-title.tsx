'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';
import { LibraryItemType } from '@rsconcept/domain/library';

import { IconOSS, IconRSForm, IconRSModel } from '@/components/icons';
import { useValueTooltipAnchor } from '@/hooks/use-value-tooltip-anchor';

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
  const tooltipAnchor = useValueTooltipAnchor(title);

  return (
    <div
      tabIndex={-1}
      className={clsx(
        'cc-fade-in min-w-0 overflow-hidden max-w-fit',
        'flex flex-1 items-center gap-2',
        'text-md text-muted-foreground pointer-events-auto'
      )}
      aria-label={tx('tx.shell.activeItem.hint')}
      {...tooltipAnchor}
    >
      <ItemIcon itemType={itemType} className='shrink-0' />
      <span className='pt-0.5 font-medium truncate'>{title}</span>
    </div>
  );
}
