'use client';

import { useTx } from '@/i18n';

import { IconAlert } from '@/components/icons';
import { TextArea } from '@/components/input';

interface TabPromptResultProps {
  prompt: string;
  hasUnresolvedVariables: boolean;
}

export function TabPromptResult({ prompt, hasUnresolvedVariables }: TabPromptResultProps) {
  const tx = useTx();
  return (
    <div className='flex flex-col gap-2'>
      {hasUnresolvedVariables ? (
        <p className='flex items-center gap-2 text-sm text-accent-orange'>
          <IconAlert size='1rem' className='shrink-0' />
          <span>{tx('tx.ai.generated.unresolved.warning')}</span>
        </p>
      ) : null}
      <TextArea
        aria-label={tx('tx.ai.generated.hint')}
        value={prompt}
        placeholder={tx('tx.ai.template.validate.empty')}
        disabled
        areaClassName='w-full h-88'
      />
    </div>
  );
}
