'use client';

import { useTx } from '@/i18n';

import { describePromptVariable } from '../../labels';
import { PromptVariableType } from '../../models/prompting';
import { extractPromptVariables } from '../../models/prompting-api';
import { useAvailableVariables } from '../../stores/use-available-variables';

interface TabPromptVariablesProps {
  template: string;
}

export function TabPromptVariables({ template }: TabPromptVariablesProps) {
  const tx = useTx();
  const variables = extractPromptVariables(template);
  const availableTypes = useAvailableVariables();
  return (
    <ul>
      {variables.length === 0 ? <li>{tx('tx.ai.variable.none')}</li> : null}
      {variables.map(variable => {
        const type = Object.values(PromptVariableType).find(t => t === variable);
        const isAvailable = !!type && availableTypes.includes(type);
        return (
          <li key={variable} className={isAvailable ? 'text-green-700 font-bold' : 'text-gray-500'}>
            {variable} — {type ? describePromptVariable(type) : tx('tx.ai.variable.unknown')}
            {isAvailable ? tx('tx.ai.variable.available.suffix') : tx('tx.ai.variable.unavailable.suffix')}
          </li>
        );
      })}
    </ul>
  );
}
