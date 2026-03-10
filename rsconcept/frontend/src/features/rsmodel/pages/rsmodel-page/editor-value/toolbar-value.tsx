'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { isInferrable } from '@/features/rsmodel/models/rsmodel-api';

import { MiniButton } from '@/components/control';
import { IconCalculateAll, IconClearData, IconReset } from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';

import { useRSModelEdit } from '../rsmodel-context';

interface ToolbarValueProps {
  className?: string;
  disabled: boolean;
  isNarrow: boolean;

  onClearValue: () => void;
  onReset: () => void;
}

export function ToolbarValue({
  className,
  disabled,
  isNarrow,

  onClearValue,
  onReset
}: ToolbarValueProps) {
  const { isMutable, model, recalculateAll } = useRSModelEdit();
  const { activeCst } = useRSFormEdit();

  const hasValue = !activeCst ? null : model.calculator.getValue(activeCst.alias) !== null;

  const showList = usePreferencesStore(state => state.showValueSideList);
  const toggleList = usePreferencesStore(state => state.toggleShowValueSideList);
  const isModified = useModificationStore(state => state.isModified);

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      {isMutable ? (
        <>
          <MiniButton
            title='Сбросить несохраненные изменения'
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={onReset}
            disabled={disabled || !isModified}
          />
          <MiniButton
            title='Удалить значение текущей конституенты'
            icon={<IconClearData size='1.25rem' className='icon-red' />}
            onClick={onClearValue}
            disabled={!activeCst || disabled || !hasValue || isInferrable(activeCst.cst_type)}
          />
        </>
      ) : null}
      <MiniButton
        titleHtml='Пересчитать модель'
        aria-label='Пересчитать все вычисления'
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={recalculateAll}
      />

      <MiniButton
        title='Отображение списка конституент'
        icon={<IconShowSidebar size='1.25rem' value={showList} isBottom={isNarrow} />}
        onClick={toggleList}
      />
      <BadgeHelp topic={HelpTopic.UI_RS_EDITOR} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
