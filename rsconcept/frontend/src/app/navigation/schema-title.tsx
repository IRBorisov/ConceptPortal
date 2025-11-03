import clsx from 'clsx';

import { IconOSS, IconRSForm } from '@/components/icons';
import { globalIDs } from '@/utils/constants';

interface SchemaTitleProps {
  isRSForm: boolean;
  title: string;
}

export function SchemaTitle({ isRSForm, title }: SchemaTitleProps) {
  return (
    <div
      tabIndex={-1}
      className={clsx(
        'min-w-0 overflow-hidden max-w-fit',
        'flex flex-1 items-center gap-2',
        'text-md text-muted-foreground pointer-events-auto'
      )}
      aria-label='Название схемы'
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-content={title}
    >
      {isRSForm ? <IconRSForm size='1.5rem' /> : <IconOSS size='1.5rem' />}
      <span className='pt-0.5 font-medium truncate'>{title}</span>
    </div>
  );
}
