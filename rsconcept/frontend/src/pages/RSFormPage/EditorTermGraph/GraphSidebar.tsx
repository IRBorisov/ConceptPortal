import { LayoutTypes } from 'reagraph';

import SelectSingle from '@/components/ui/SelectSingle';
import { GraphColoringScheme } from '@/models/miscellaneous';
import { mapLabelColoring, mapLabelLayout } from '@/utils/labels';
import { SelectorGraphColoring, SelectorGraphLayout } from '@/utils/selectors';

interface GraphSidebarProps {
  coloring: GraphColoringScheme;
  layout: LayoutTypes;

  setLayout: (newValue: LayoutTypes) => void;
  setColoring: (newValue: GraphColoringScheme) => void;
}

function GraphSidebar({ coloring, setColoring, layout, setLayout }: GraphSidebarProps) {
  return (
    <div className='px-2 text-sm select-none mt-9'>
      <SelectSingle
        placeholder='Выберите цвет'
        options={SelectorGraphColoring}
        isSearchable={false}
        value={coloring ? { value: coloring, label: mapLabelColoring.get(coloring) } : null}
        onChange={data => setColoring(data?.value ?? SelectorGraphColoring[0].value)}
      />
      <SelectSingle
        placeholder='Способ расположения'
        options={SelectorGraphLayout}
        isSearchable={false}
        value={layout ? { value: layout, label: mapLabelLayout.get(layout) } : null}
        onChange={data => setLayout(data?.value ?? SelectorGraphLayout[0].value)}
      />
    </div>
  );
}

export default GraphSidebar;
