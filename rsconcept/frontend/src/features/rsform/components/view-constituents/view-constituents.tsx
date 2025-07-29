'use client';

import { type IConstituenta, type IRSForm } from '@/features/rsform/models/rsform';

import { cn } from '@/components/utils';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ViewConstituentsProps {
  schema: IRSForm;
  activeCst?: IConstituenta | null;
  onActivate?: (cst: IConstituenta) => void;
  onDoubleClick?: (cst: IConstituenta) => void;

  className?: string;
  maxListHeight?: string;
  noBorder?: boolean;
  dense?: boolean;
  autoScroll?: boolean;
}

export function ViewConstituents({
  schema,
  activeCst,
  onActivate,
  onDoubleClick,

  className,
  maxListHeight,
  dense,
  noBorder,
  autoScroll
}: ViewConstituentsProps) {
  return (
    <div className={cn(!noBorder && 'border', className)}>
      <ConstituentsSearch
        dense={dense} //
        hideGraphFilter={!activeCst}
      />
      <TableSideConstituents
        schema={schema}
        activeCst={activeCst}
        onActivate={onActivate}
        maxHeight={maxListHeight}
        autoScroll={autoScroll}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}
