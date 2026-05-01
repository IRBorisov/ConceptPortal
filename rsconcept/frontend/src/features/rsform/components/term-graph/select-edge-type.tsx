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

  return (
    <div className={cn('relative border select-none bg-input pointer-events-auto', className)}>
      <Select onValueChange={setGraphType} value={graphType}>
        <SelectTrigger noBorder className='w-full'>
          <SelectValue placeholder={tx('ui.rsform.termGraph.colorSchemePlaceholder', 'Color scheme')} />
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
