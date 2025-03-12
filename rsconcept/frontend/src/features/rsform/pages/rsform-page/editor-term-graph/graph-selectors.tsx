import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { SelectSingle } from '@/components/input';

import { mapLabelColoring } from '../../../labels';
import { type GraphColoring, useTermGraphStore } from '../../../stores/term-graph';

import { SchemasGuide } from './schemas-guide';

/**
 * Represents options for {@link GraphColoring} selector.
 */
const SelectorGraphColoring: { value: GraphColoring; label: string }[] = //
  [...mapLabelColoring.entries()].map(item => ({ value: item[0], label: item[1] }));

export function GraphSelectors() {
  const coloring = useTermGraphStore(state => state.coloring);
  const setColoring = useTermGraphStore(state => state.setColoring);

  return (
    <div className='relative border rounded-b-none select-none clr-input rounded-t-md pointer-events-auto'>
      <div className='absolute z-pop right-10 h-10 flex items-center'>
        {coloring === 'status' ? <BadgeHelp topic={HelpTopic.UI_CST_STATUS} contentClass='min-w-100' /> : null}
        {coloring === 'type' ? <BadgeHelp topic={HelpTopic.UI_CST_CLASS} contentClass='min-w-100]' /> : null}
        {coloring === 'schemas' ? <SchemasGuide /> : null}
      </div>
      <SelectSingle
        noBorder
        placeholder='Цветовая схема'
        options={SelectorGraphColoring}
        isSearchable={false}
        value={coloring ? { value: coloring, label: mapLabelColoring.get(coloring) } : null}
        onChange={data => setColoring(data?.value ?? SelectorGraphColoring[0].value)}
      />
    </div>
  );
}
