'use client';

import { TextArea } from '@/components/input';

import { PromptInput } from '../../components/prompt-input';
import { useAvailableVariables } from '../../stores/use-available-variables';

interface TabPromptEditProps {
  label: string;
  description: string;
  text: string;
  setText: (value: string) => void;
}

export function TabPromptEdit({ label, description, text, setText }: TabPromptEditProps) {
  const availableVariables = useAvailableVariables();
  return (
    <div className='cc-column'>
      <div className='flex flex-col gap-2'>
        <TextArea
          id='prompt-label'
          label='Название' //
          value={label}
          disabled
          noResize
          rows={1}
        />
        <TextArea id='prompt-description' label='Описание' value={description} disabled noResize rows={3} />
        <PromptInput
          id='prompt-text' //
          label='Текст шаблона'
          value={text}
          onChange={setText}
          maxHeight='10rem'
          availableVariables={availableVariables}
        />
      </div>
    </div>
  );
}
