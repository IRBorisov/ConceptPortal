'use client';

import { useTx } from '@/i18n';

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
  const tx = useTx();
  const availableVariables = useAvailableVariables();
  return (
    <div className='cc-column'>
      <div className='flex flex-col gap-2'>
        <TextArea id='prompt-label' label={tx('tx.lib.title')} value={label} disabled noResize rows={1} />
        <TextArea
          id='prompt-description'
          label={tx('tx.lib.description')}
          value={description}
          disabled
          noResize
          rows={3}
          areaClassName='h-12'
        />
        <PromptInput
          id='prompt-text'
          label={tx('tx.ai.template.text')}
          value={text}
          onChange={setText}
          maxHeight='9.5rem'
          availableVariables={availableVariables}
        />
      </div>
    </div>
  );
}
