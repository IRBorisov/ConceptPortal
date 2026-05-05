'use client';

import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { MiniButton } from '@/components/control';
import { IconCalculateAll } from '@/components/icons';
import { cn } from '@/components/utils';
import { prepareTooltip } from '@/utils/format';

import { useModelEdit } from '../model-edit-context';

interface ToolbarEvaluatorProps {
  className?: string;
}

export function ToolbarEvaluator({ className }: ToolbarEvaluatorProps) {
  const tx = useTx();
  const { engine } = useModelEdit();

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      <MiniButton
        title={prepareTooltip(tx('tx.lib.model.recalculate'), 'Alt + Q')}
        aria-label={tx('tx.lib.model.recalculate.hint')}
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={() => engine.recalculateAll()}
      />

      <BadgeHelp topic={HelpTopic.UI_MODEL_EVALUATOR} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
