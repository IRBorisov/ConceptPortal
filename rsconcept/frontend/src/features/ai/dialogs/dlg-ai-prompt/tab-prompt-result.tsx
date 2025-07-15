import { useMemo } from 'react';
import { toast } from 'react-toastify';

import { MiniButton } from '@/components/control';
import { IconClone } from '@/components/icons';
import { TextArea } from '@/components/input';
import { infoMsg } from '@/utils/labels';

import { usePromptTemplateSuspense } from '../../backend/use-prompt-template';
import { PromptVariableType } from '../../models/prompting';
import { extractPromptVariables } from '../../models/prompting-api';
import { evaluatePromptVariable, useAIStore } from '../../stores/ai-context';

interface TabPromptResultProps {
  promptID: number;
}

export function TabPromptResult({ promptID }: TabPromptResultProps) {
  const { promptTemplate } = usePromptTemplateSuspense(promptID);
  const context = useAIStore();
  const variables = useMemo(() => {
    return promptTemplate ? extractPromptVariables(promptTemplate.text) : [];
  }, [promptTemplate]);

  const generatedMessage = (() => {
    if (!promptTemplate) {
      return '';
    }
    let result = promptTemplate.text;
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

  function handleCopyPrompt() {
    void navigator.clipboard.writeText(generatedMessage);
    toast.success(infoMsg.promptReady);
  }

  return (
    <div className='relative'>
      <MiniButton
        title='Скопировать в буфер обмена'
        className='absolute -top-23 left-0'
        icon={<IconClone size='1.25rem' className='icon-green' />}
        onClick={handleCopyPrompt}
        disabled={!generatedMessage}
      />
      <TextArea
        aria-label='Сгенерированное сообщение'
        value={generatedMessage}
        placeholder='Текст шаблона пуст'
        disabled
        fitContent
        className='w-full max-h-100 min-h-12'
      />
    </div>
  );
}
