'use client';

import { cn } from '@/components/utils';

import { type Constituenta, type RSForm } from '../../models/rsform';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ViewConstituentsProps {
  schema: RSForm;
  activeCst?: Constituenta | null;
  onActivate?: (cst: Constituenta) => void;
  onDoubleClick?: (cst: Constituenta) => void;

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
