'use client';

import { useTx } from '@/app/i18n/use-tx';

import { TextArea } from '@/components/input';

interface TabPromptResultProps {
  prompt: string;
}

export function TabPromptResult({ prompt }: TabPromptResultProps) {
  const tx = useTx();
  return (
    <TextArea
      aria-label={tx('ui.aiPrompt.result.ariaLabel', 'Generated message')}
      value={prompt}
      placeholder={tx('ui.aiPrompt.result.emptyPlaceholder', 'Template text is empty')}
      disabled
      areaClassName='w-full h-88'
    />
  );
}
