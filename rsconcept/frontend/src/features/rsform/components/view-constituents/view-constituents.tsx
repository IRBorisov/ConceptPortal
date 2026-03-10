'use client';

import { type EvalStatus, type RSModel } from '@/features/rsmodel';

import { cn } from '@/components/utils';

import { type Constituenta, type RSForm } from '../../models/rsform';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ViewConstituentsProps {
  schema: RSForm;
  model?: RSModel;
  activeCst?: Constituenta | null;
  getEvalStatus?: (cstID: number) => EvalStatus;

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
  model,
  activeCst,
  getEvalStatus,

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
        model={model}
        activeCst={activeCst}
        getEvalStatus={getEvalStatus}
        onActivate={onActivate}
        maxHeight={maxListHeight}
        autoScroll={autoScroll}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}
