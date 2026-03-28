'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';

import { MiniButton } from '@/components/control';
import { IconCalculateAll } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

import { useRSModelEdit } from '../rsmodel-context';

interface ToolbarEvaluatorProps {
  className?: string;
  isNarrow: boolean;
}

export function ToolbarEvaluator({
  className,
  isNarrow,
}: ToolbarEvaluatorProps) {
  const { engine } = useRSModelEdit();

  const showList = usePreferencesStore(state => state.showValueSideList);
  const toggleList = usePreferencesStore(state => state.toggleShowValueSideList);

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      <MiniButton
        titleHtml='Пересчитать модель'
        aria-label='Пересчитать все вычисления'
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={() => { engine.recalculateAll(); }}
      />

      <MiniButton
        title='Отображение списка конституент'
        icon={<IconShowSidebar size='1.25rem' value={showList} isBottom={isNarrow} />}
        onClick={toggleList}
      />
      <BadgeHelp topic={HelpTopic.UI_RSMODEL_EVALUATOR} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
