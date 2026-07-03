'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';
import { LibraryItemType } from '@rsconcept/domain/library';

import { IconOSS, IconRSForm, IconRSModel } from '@/components/icons';
import { globalIDs } from '@/utils/constants';

interface SchemaTitleProps {
  itemType: LibraryItemType;
  title: string;
  archiveVersionLabel?: string;
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

export function CurrentTitle({ itemType, title, archiveVersionLabel }: SchemaTitleProps) {
  const tx = useTx();
  const tooltipText = archiveVersionLabel
    ? tx('tx.shell.activeItem.archive.hint', { title, version: archiveVersionLabel })
    : title;

  return (
    <div
      tabIndex={-1}
      className={clsx(
        'cc-fade-in relative z-pop min-w-0 overflow-hidden max-w-fit',
        'flex flex-1 items-center gap-2',
        'text-md text-muted-foreground pointer-events-auto'
      )}
      aria-label={archiveVersionLabel ? tooltipText : tx('tx.shell.activeItem.hint')}
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-content={tooltipText}
    >
      <ItemIcon itemType={itemType} className='shrink-0' />
      {archiveVersionLabel ? (
        <>
          <span className='pt-0.5 shrink-0 font-medium text-accent-orange truncate'>{archiveVersionLabel}</span>
          <span aria-hidden className='shrink-0 text-muted-foreground/60'>
            ·
          </span>
        </>
      ) : null}
      <span className='pt-0.5 font-medium truncate'>{title}</span>
    </div>
  );
}
