import { LayoutTypes } from 'reagraph';

import SelectSingle from '@/components/Common/SelectSingle';
import { GraphColoringScheme } from '@/models/miscelanious';
import { mapLabelColoring, mapLableLayout } from '@/utils/labels';
import { SelectorGraphColoring, SelectorGraphLayout } from '@/utils/selectors';

interface GraphSidebarProps {
  coloring: GraphColoringScheme
  layout: LayoutTypes

  setLayout: (newValue: LayoutTypes) => void
  setColoring: (newValue: GraphColoringScheme) => void
}

function GraphSidebar({
  coloring, setColoring,
  layout, setLayout
} : GraphSidebarProps) {
  return (
    <div className='flex flex-col px-2 text-sm select-none mt-9 h-fit'>        
    <SelectSingle
      placeholder='Выберите цвет'
      options={SelectorGraphColoring}
      isSearchable={false}
      value={coloring ? { value: coloring, label: mapLabelColoring.get(coloring) } : null}
      onChange={data => setColoring(data?.value ?? SelectorGraphColoring[0].value)}
    />
    <SelectSingle
      placeholder='Способ расположения'
      className='w-full'
      options={SelectorGraphLayout}
      isSearchable={false}
      value={layout ? { value: layout, label: mapLableLayout.get(layout) } : null}
      onChange={data => setLayout(data?.value ?? SelectorGraphLayout[0].value)}
    />
  </div>);
}

export default GraphSidebar;