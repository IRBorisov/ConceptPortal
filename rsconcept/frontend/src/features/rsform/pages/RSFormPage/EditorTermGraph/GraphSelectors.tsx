import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { Overlay } from '@/components/Container';
import { SelectSingle } from '@/components/Input';

import { mapLabelColoring } from '../../../labels';
import { type GraphColoring, useTermGraphStore } from '../../../stores/termGraph';

import { SchemasGuide } from './SchemasGuide';

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
      <Overlay position='right-[2.5rem] top-[0.25rem]'>
        {coloring === 'status' ? <BadgeHelp topic={HelpTopic.UI_CST_STATUS} className='min-w-[25rem]' /> : null}
        {coloring === 'type' ? <BadgeHelp topic={HelpTopic.UI_CST_CLASS} className='min-w-[25rem]' /> : null}
        {coloring === 'schemas' ? <SchemasGuide /> : null}
      </Overlay>
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
