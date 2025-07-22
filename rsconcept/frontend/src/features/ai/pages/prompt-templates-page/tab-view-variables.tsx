import { useFitHeight } from '@/stores/app-layout';

import { describePromptVariable } from '../../labels';
import { PromptVariableType } from '../../models/prompting';

/** Displays all prompt variable types with their descriptions. */
export function TabViewVariables() {
  const panelHeight = useFitHeight('3rem');

  return (
    <div className='mt-10 cc-scroll-y min-h-40' style={{ maxHeight: panelHeight }}>
      <ul className='space-y-1'>
        {Object.values(PromptVariableType).map(variableType => (
          <li key={variableType} className='flex flex-col'>
            <span className='font-math text-primary'>{`{{${variableType}}}`}</span>
            <span className='font-main text-muted-foreground'>{describePromptVariable(variableType)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
