import { GraphLayout } from '@/components/ui/GraphUI';
import SelectSingle from '@/components/ui/SelectSingle';
import { GraphColoring, GraphSizing } from '@/models/miscellaneous';
import { mapLabelColoring, mapLabelLayout, mapLabelSizing } from '@/utils/labels';
import { SelectorGraphColoring, SelectorGraphLayout, SelectorGraphSizing } from '@/utils/selectors';

interface GraphSelectorsProps {
  coloring: GraphColoring;
  layout: GraphLayout;
  sizing: GraphSizing;

  setLayout: (newValue: GraphLayout) => void;
  setColoring: (newValue: GraphColoring) => void;
  setSizing: (newValue: GraphSizing) => void;
}

function GraphSelectors({ coloring, setColoring, layout, setLayout, sizing, setSizing }: GraphSelectorsProps) {
  return (
    <div className='select-none border rounded-t-md rounded-b-none divide-y'>
      <SelectSingle
        noBorder
        placeholder='Способ расположения'
        options={SelectorGraphLayout}
        isSearchable={false}
        value={layout ? { value: layout, label: mapLabelLayout.get(layout) } : null}
        onChange={data => setLayout(data?.value ?? SelectorGraphLayout[0].value)}
      />
      <SelectSingle
        noBorder
        placeholder='Цветовая схема'
        options={SelectorGraphColoring}
        isSearchable={false}
        value={coloring ? { value: coloring, label: mapLabelColoring.get(coloring) } : null}
        onChange={data => setColoring(data?.value ?? SelectorGraphColoring[0].value)}
      />
      <SelectSingle
        noBorder
        placeholder='Размер узлов'
        options={SelectorGraphSizing}
        isSearchable={false}
        value={layout ? { value: sizing, label: mapLabelSizing.get(sizing) } : null}
        onChange={data => setSizing(data?.value ?? SelectorGraphSizing[0].value)}
      />
    </div>
  );
}

export default GraphSelectors;
