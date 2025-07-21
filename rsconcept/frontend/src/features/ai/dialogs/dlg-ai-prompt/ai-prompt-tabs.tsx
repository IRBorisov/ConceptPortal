'use client';

import { useEffect, useState } from 'react';

import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';

import { usePromptTemplateSuspense } from '../../backend/use-prompt-template';
import { PromptVariableType } from '../../models/prompting';
import { extractPromptVariables } from '../../models/prompting-api';
import { evaluatePromptVariable, useAIStore } from '../../stores/ai-context';

import { MenuAIPrompt } from './menu-ai-prompt';
import { TabPromptEdit } from './tab-prompt-edit';
import { TabPromptResult } from './tab-prompt-result';
import { TabPromptVariables } from './tab-prompt-variables';

interface AIPromptTabsProps {
  promptID: number;
  activeTab: number;
  setActiveTab: (value: TabID) => void;
}

export const TabID = {
  TEMPLATE: 0,
  RESULT: 1,
  VARIABLES: 2
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

export function AIPromptTabs({ promptID, activeTab, setActiveTab }: AIPromptTabsProps) {
  const context = useAIStore();
  const { promptTemplate } = usePromptTemplateSuspense(promptID);
  const [text, setText] = useState(promptTemplate.text);
  const variables = extractPromptVariables(text);

  const generatedPrompt = (() => {
    let result = text;
    for (const variable of variables) {
      const type = Object.values(PromptVariableType).find(t => t === variable);
      let value = '';
      if (type) {
        value = evaluatePromptVariable(type, context) ?? '';
      }
      result = result.replace(new RegExp(`\{\{${variable}\}\}`, 'g'), value || `${variable}`);
    }
    return result;
  })();

  useEffect(() => {
    setText(promptTemplate.text);
  }, [promptTemplate]);

  return (
    <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
      <TabList className='mx-auto w-fit flex border-x border-b divide-x rounded-none'>
        <MenuAIPrompt promptID={promptID} generatedPrompt={generatedPrompt} />

        <TabLabel label='Шаблон' />
        <TabLabel label='Результат' />
        <TabLabel label='Переменные' />
      </TabList>

      <div className='h-80 flex flex-col gap-2'>
        <TabPanel>
          <TabPromptEdit
            text={text}
            setText={setText}
            label={promptTemplate.label}
            description={promptTemplate.description}
          />
        </TabPanel>
        <TabPanel>
          <TabPromptResult prompt={generatedPrompt} />
        </TabPanel>
        <TabPanel>
          <TabPromptVariables template={text} />
        </TabPanel>
      </div>
    </Tabs>
  );
}
