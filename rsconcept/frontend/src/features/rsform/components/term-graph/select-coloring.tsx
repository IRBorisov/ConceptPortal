'use client';

import { type RSForm } from '@rsconcept/domain/library';
import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { labelColoring } from '../../labels';
import { TGColoring, useTermGraphStore } from '../../stores/term-graph';

import { SchemasGuide } from './schemas-guide';

interface SelectColoringProps {
  className?: string;
  schema: RSForm;
}

export function SelectColoring({ className, schema }: SelectColoringProps) {
  const tx = useTx();
  const coloring = useTermGraphStore(state => state.coloring);
  const setColoring = useTermGraphStore(state => state.setColoring);

  const items = Object.fromEntries(Object.values(TGColoring).map(v => [v, labelColoring(v)] as const)) as Record<
    TGColoring,
    string
  >;

  return (
    <div className={cn('relative select-none bg-input border pointer-events-auto', className)}>
      <div className='absolute z-pop right-10 h-9 flex items-center'>
        {coloring === TGColoring.status ? <BadgeHelp topic={HelpTopic.UI_CST_STATUS} contentClass='min-w-100' /> : null}
        {coloring === TGColoring.type ? <BadgeHelp topic={HelpTopic.UI_CST_CLASS} contentClass='min-w-100' /> : null}
        {coloring === TGColoring.schemas ? <SchemasGuide schema={schema} /> : null}
      </div>

      <Select items={items} onValueChange={newValue => setColoring(newValue!)} value={coloring}>
        <SelectTrigger noBorder className='w-full'>
          <SelectValue placeholder={tx('tx.termGraph.coloring')} />
        </SelectTrigger>
        <SelectContent alignOffset={-1} sideOffset={-4}>
          {Object.values(TGColoring).map(value => (
            <SelectItem key={`coloring-${value}`} value={value}>
              {labelColoring(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
