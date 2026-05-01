'use client';

import { useTx } from '@/i18n';

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
