import BadgeHelp from '@/components/info/BadgeHelp';
import { Overlay } from '@/components/ui/Container';
import { SelectSingle } from '@/components/ui/Input';
import { GraphColoring, HelpTopic } from '@/models/miscellaneous';
import { IRSForm } from '@/models/rsform';
import { mapLabelColoring } from '@/utils/labels';
import { SelectorGraphColoring } from '@/utils/selectors';

import SchemasGuide from './SchemasGuide';

interface GraphSelectorsProps {
  schema: IRSForm;
  coloring: GraphColoring;
  onChangeColoring: (newValue: GraphColoring) => void;
}

function GraphSelectors({ schema, coloring, onChangeColoring }: GraphSelectorsProps) {
  return (
    <div className='border rounded-b-none select-none clr-input rounded-t-md pointer-events-auto'>
      <Overlay position='right-[2.5rem] top-[0.25rem]'>
        {coloring === 'status' ? <BadgeHelp topic={HelpTopic.UI_CST_STATUS} className='min-w-[25rem]' /> : null}
        {coloring === 'type' ? <BadgeHelp topic={HelpTopic.UI_CST_CLASS} className='min-w-[25rem]' /> : null}
        {coloring === 'schemas' ? <SchemasGuide schema={schema} /> : null}
      </Overlay>
      <SelectSingle
        noBorder
        placeholder='Цветовая схема'
        options={SelectorGraphColoring}
        isSearchable={false}
        value={coloring ? { value: coloring, label: mapLabelColoring.get(coloring) } : null}
        onChange={data => onChangeColoring(data?.value ?? SelectorGraphColoring[0].value)}
      />
    </div>
  );
}

export default GraphSelectors;
