import { describePromptVariable } from '../../labels';
import { PromptVariableType } from '../../models/prompting';

/** Displays all prompt variable types with their descriptions. */
export function TabViewVariables() {
  return (
    <div className='pt-8'>
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
