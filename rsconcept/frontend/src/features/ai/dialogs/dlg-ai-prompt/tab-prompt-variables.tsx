'use client';

import { usePromptTemplateSuspense } from '../../backend/use-prompt-template';
import { describePromptVariable } from '../../labels';
import { PromptVariableType } from '../../models/prompting';
import { extractPromptVariables } from '../../models/prompting-api';
import { useAvailableVariables } from '../../stores/use-available-variables';

interface TabPromptVariablesProps {
  promptID: number;
}

export function TabPromptVariables({ promptID }: TabPromptVariablesProps) {
  const { promptTemplate } = usePromptTemplateSuspense(promptID);
  const variables = extractPromptVariables(promptTemplate.text);
  const availableTypes = useAvailableVariables();
  return (
    <ul>
      {variables.length === 0 && <li>Нет переменных</li>}
      {variables.map(variable => {
        const type = Object.values(PromptVariableType).find(t => t === variable);
        const isAvailable = !!type && availableTypes.includes(type);
        return (
          <li key={variable} className={isAvailable ? 'text-green-700 font-bold' : 'text-gray-500'}>
            {variable} — {type ? describePromptVariable(type) : 'Неизвестная переменная'}
            {isAvailable ? ' (доступна)' : ' (нет в контексте)'}
          </li>
        );
      })}
    </ul>
  );
}
