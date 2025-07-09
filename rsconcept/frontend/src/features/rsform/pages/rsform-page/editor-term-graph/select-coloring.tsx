import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type IRSForm } from '@/features/rsform/models/rsform';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { mapLabelColoring } from '../../../labels';
import { useTermGraphStore } from '../../../stores/term-graph';

import { SchemasGuide } from './schemas-guide';

interface SelectColoringProps {
  className?: string;
  schema: IRSForm;
}

export function SelectColoring({ className, schema }: SelectColoringProps) {
  const coloring = useTermGraphStore(state => state.coloring);
  const setColoring = useTermGraphStore(state => state.setColoring);

  return (
    <div
      className={cn('relative border rounded-b-none select-none bg-input rounded-t-md pointer-events-auto', className)}
    >
      <div className='absolute z-pop right-10 h-9 flex items-center'>
        {coloring === 'status' ? <BadgeHelp topic={HelpTopic.UI_CST_STATUS} contentClass='min-w-100' /> : null}
        {coloring === 'type' ? <BadgeHelp topic={HelpTopic.UI_CST_CLASS} contentClass='min-w-100' /> : null}
        {coloring === 'schemas' ? <SchemasGuide schema={schema} /> : null}
      </div>

      <Select onValueChange={setColoring} defaultValue={coloring}>
        <SelectTrigger noBorder className='w-full'>
          <SelectValue placeholder='Цветовая схема' />
        </SelectTrigger>
        <SelectContent alignOffset={-1} sideOffset={-4}>
          {[...mapLabelColoring.entries()].map(item => (
            <SelectItem key={`coloring-${item[0]}`} value={item[0]}>
              {item[1]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
