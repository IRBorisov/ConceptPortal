'use client';

import { type ReactNode } from 'react';

import { type Constituenta, type RSEngine, type RSForm } from '@rsconcept/domain/library';

import { cn } from '@/components/utils';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ViewConstituentsProps {
  schema: RSForm;
  engine?: RSEngine;
  activeCst?: Constituenta | null;
  isSchemaIssue?: (cst: Constituenta) => boolean;
  isModelIssue?: (cst: Constituenta) => boolean;

  onActivate?: (cst: Constituenta) => void;
  onDoubleClick?: (cst: Constituenta) => void;
  enableRowReordering?: boolean;
  onMoveAfter?: (target: Constituenta | null, items: Constituenta[]) => void;

  className?: string;
  maxListHeight?: string;
  noBorder?: boolean;
  autoScroll?: boolean;
  sidebarActions?: ReactNode;
  stopSearchKeyPropagation?: boolean;
}

export function ViewConstituents({
  schema,
  engine,
  activeCst,
  isSchemaIssue,
  isModelIssue,

  onActivate,
  onDoubleClick,
  enableRowReordering,
  onMoveAfter,

  className,
  maxListHeight,
  noBorder,
  autoScroll,
  sidebarActions,
  stopSearchKeyPropagation
}: ViewConstituentsProps) {
  return (
    <div className={cn(!noBorder && 'border', className)}>
      <ConstituentsSearch
        actions={sidebarActions}
        showModelFilter={!!isModelIssue}
        stopSearchKeyPropagation={stopSearchKeyPropagation}
      />
      <TableSideConstituents
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        isSchemaIssue={isSchemaIssue}
        isModelIssue={isModelIssue}
        onActivate={onActivate}
        enableRowReordering={enableRowReordering}
        onMoveAfter={onMoveAfter}
        maxHeight={maxListHeight}
        autoScroll={autoScroll}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}
