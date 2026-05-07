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
      aria-label={tx('tx.ai.generated.hint')}
      value={prompt}
      placeholder={tx('tx.ai.template.validate.empty')}
      disabled
      areaClassName='w-full h-88'
    />
  );
}
