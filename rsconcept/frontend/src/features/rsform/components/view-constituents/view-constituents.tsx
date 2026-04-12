'use client';

import { type RSEngine } from '@/features/rsmodel';

import { cn } from '@/components/utils';

import { type Constituenta, type RSForm } from '../../models/rsform';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ViewConstituentsProps {
  schema: RSForm;
  engine?: RSEngine;
  activeCst?: Constituenta | null;

  onActivate?: (cst: Constituenta) => void;
  onDoubleClick?: (cst: Constituenta) => void;

  className?: string;
  maxListHeight?: string;
  noBorder?: boolean;
  autoScroll?: boolean;
}

export function ViewConstituents({
  schema,
  engine,
  activeCst,

  onActivate,
  onDoubleClick,

  className,
  maxListHeight,
  noBorder,
  autoScroll
}: ViewConstituentsProps) {
  return (
    <div className={cn(!noBorder && 'border', className)}>
      <ConstituentsSearch />
      <TableSideConstituents
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        onActivate={onActivate}
        maxHeight={maxListHeight}
        autoScroll={autoScroll}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}
