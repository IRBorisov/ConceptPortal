'use client';

import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { ModelTourID } from '@/features/onboarding/tours/editor-tours';
import { IconEvaluatorCache } from '@/features/rsmodel/components/icon-evaluator-cache';

import { MiniButton } from '@/components/control';
import { IconCalculateAll } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { prepareTooltip } from '@/utils/format';

import { useModelEdit } from '../model-edit-context';

interface ToolbarEvaluatorProps {
  className?: string;
}

export function ToolbarEvaluator({ className }: ToolbarEvaluatorProps) {
  const tx = useTx();
  const { engine } = useModelEdit();
  const disableCache = usePreferencesStore(state => state.disableCache);
  const toggleDisableCache = usePreferencesStore(state => state.toggleDisableCache);

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)} data-tour='model-evaluator-tools'>
      <MiniButton
        title={tx('tx.rslang.eval.disableCache.hint')}
        icon={<IconEvaluatorCache value={!disableCache} size='1.25rem' className='hover:text-primary' />}
        onClick={toggleDisableCache}
      />
      <MiniButton
        title={prepareTooltip(tx('tx.model.recalculate'), 'Alt + Q')}
        aria-label={tx('tx.model.recalculate.hint')}
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={() => engine.recalculateAll()}
      />

      <BadgeHelp
        topic={HelpTopic.UI_MODEL_EVALUATOR}
        tourID={ModelTourID.EVALUATOR}
        offset={4}
        contentClass='sm:max-w-160'
      />
    </div>
  );
}
