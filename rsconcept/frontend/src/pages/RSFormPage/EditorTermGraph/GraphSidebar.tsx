import { LayoutTypes } from 'reagraph';

import SelectSingle from '../../../components/Common/SelectSingle';
import { GraphColoringScheme } from '../../../models/miscelanious';
import { mapLabelColoring, mapLableLayout } from '../../../utils/labels';
import { SelectorGraphColoring, SelectorGraphLayout } from '../../../utils/selectors';

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
    <div className='flex flex-col px-2 pb-2 mt-8 text-sm select-none h-fit'>        
    <div className='flex items-center w-full gap-1 text-sm'>
      <SelectSingle
        placeholder='Выберите цвет'
        options={SelectorGraphColoring}
        isSearchable={false}
        value={coloring ? { value: coloring, label: mapLabelColoring.get(coloring) } : null}
        onChange={data => setColoring(data?.value ?? SelectorGraphColoring[0].value)}
      />
    </div>
    <SelectSingle
      placeholder='Способ расположения'
      className='w-full mt-1'
      options={SelectorGraphLayout}
      isSearchable={false}
      value={layout ? { value: layout, label: mapLableLayout.get(layout) } : null}
      onChange={data => setLayout(data?.value ?? SelectorGraphLayout[0].value)}
    />
  </div>);
}

export default GraphSidebar;