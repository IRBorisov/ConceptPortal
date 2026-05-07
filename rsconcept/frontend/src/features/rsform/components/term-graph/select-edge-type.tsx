'use client';

import { useTx } from '@/i18n';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { labelEdgeType } from '../../labels';
import { TGEdgeType, useTermGraphStore } from '../../stores/term-graph';

interface SelectEdgeTypeProps {
  className?: string;
}

export function SelectEdgeType({ className }: SelectEdgeTypeProps) {
  const tx = useTx();
  const graphType = useTermGraphStore(state => state.filter.graphType);
  const setGraphType = useTermGraphStore(state => state.setGraphType);

  const items = Object.fromEntries(Object.values(TGEdgeType).map(v => [v, labelEdgeType(v)] as const)) as Record<
    TGEdgeType,
    string
  >;

  return (
    <div className={cn('relative border select-none bg-input pointer-events-auto', className)}>
      <Select items={items} onValueChange={newValue => setGraphType(newValue!)} value={graphType}>
        <SelectTrigger noBorder className='w-full'>
          <SelectValue placeholder={tx('tx.termGraph.coloring')} />
        </SelectTrigger>
        <SelectContent alignOffset={-1} sideOffset={-4}>
          {Object.values(TGEdgeType).map(value => (
            <SelectItem key={`graphType-${value}`} value={value}>
              {labelEdgeType(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
