import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { labelGraphType } from '../../labels';
import { graphTypes, useTermGraphStore } from '../../stores/term-graph';

interface SelectGraphTypeProps {
  className?: string;
}

export function SelectGraphType({ className }: SelectGraphTypeProps) {
  const graphType = useTermGraphStore(state => state.filter.graphType);
  const setGraphType = useTermGraphStore(state => state.setGraphType);

  return (
    <div className={cn('relative border select-none bg-input pointer-events-auto', className)}>
      <Select onValueChange={setGraphType} defaultValue={graphType}>
        <SelectTrigger noBorder className='w-full'>
          <SelectValue placeholder='Цветовая схема' />
        </SelectTrigger>
        <SelectContent alignOffset={-1} sideOffset={-4}>
          {graphTypes.map(mode => (
            <SelectItem key={`graphType-${mode}`} value={mode}>
              {labelGraphType(mode)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
