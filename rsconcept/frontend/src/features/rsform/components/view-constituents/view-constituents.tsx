'use client';

import { type ReactNode } from 'react';

import { type Constituenta, type RSEngine, type RSForm } from '@/domain/library';

import { cn } from '@/components/utils';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ViewConstituentsProps {
  schema: RSForm;
  engine?: RSEngine;
  activeCst?: Constituenta | null;
  isProblematic?: (cst: Constituenta) => boolean;
  isEvalIssue?: (cst: Constituenta) => boolean;

  onActivate?: (cst: Constituenta) => void;
  onDoubleClick?: (cst: Constituenta) => void;

  className?: string;
  maxListHeight?: string;
  noBorder?: boolean;
  autoScroll?: boolean;
  sidebarActions?: ReactNode;
}

export function ViewConstituents({
  schema,
  engine,
  activeCst,
  isProblematic,
  isEvalIssue,

  onActivate,
  onDoubleClick,

  className,
  maxListHeight,
  noBorder,
  autoScroll,
  sidebarActions
}: ViewConstituentsProps) {
  return (
    <div className={cn(!noBorder && 'border', className)}>
      <ConstituentsSearch actions={sidebarActions} showModelFilter={!!isEvalIssue} />
      <TableSideConstituents
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        isProblematic={isProblematic}
        isEvalIssue={isEvalIssue}
        onActivate={onActivate}
        maxHeight={maxListHeight}
        autoScroll={autoScroll}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}
