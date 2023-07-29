import { Ref } from 'react';
import { darkTheme, GraphCanvas, GraphCanvasProps, GraphCanvasRef, lightTheme } from 'reagraph';

import { useConceptTheme } from '../../context/ThemeContext';
import { resources } from '../../utils/constants';

interface GraphThemedProps
extends Omit<GraphCanvasProps, 'theme' | 'labelFontUrl'> {
  ref?: Ref<GraphCanvasRef>
  sizeClass: string
}

function GraphThemed({ sizeClass, ...props }: GraphThemedProps) {
  const { darkMode } = useConceptTheme();
  
  return (
    <div className='flex-wrap w-full h-full overflow-auto'>
      <div className={`relative border ${sizeClass}`}>
      <GraphCanvas
        theme={darkMode ? darkTheme : lightTheme}
        labelFontUrl={resources.graph_font}
        {...props}
      />
      </div>
    </div>
  );
}

export default GraphThemed;
