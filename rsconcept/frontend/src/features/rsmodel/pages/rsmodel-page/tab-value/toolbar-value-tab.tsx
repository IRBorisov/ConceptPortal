'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';
import { getStructureName, isBaseSet } from '@/features/rsform/models/rsform-api';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { type TypePath, type Typification, type Value } from '@/features/rslang';
import { normalizeValue } from '@/features/rslang/eval/value-api';
import { isTypification } from '@/features/rslang/semantic/typification';

import { MiniButton } from '@/components/control';
import { IconCalculateAll, IconCalculateOne, IconDatabase, IconDestroy, IconReset } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';

import { useMutatingRSModel } from '../../../backend/use-mutating-rsmodel';
import { useCstValue } from '../../../hooks/use-cst-value';
import { isInferrable } from '../../../models/rsmodel-api';
import { useRSModelEdit } from '../rsmodel-context';

interface ToolbarValueTabProps {
  className?: string;
  isNarrow: boolean;

  onClearValue: () => void;
  onReset: () => void;
}

export function ToolbarValueTab({
  className,
  isNarrow,
  onClearValue,
  onReset
}: ToolbarValueTabProps) {
  const { isMutable, engine } = useRSModelEdit();
  const { activeCst, schema } = useRSFormEdit();
  const isProcessing = useMutatingRSModel();

  const value = useCstValue(engine, activeCst ?? null);
  const hasValue = value !== null;

  const showList = usePreferencesStore(state => state.showValueSideList);
  const toggleList = usePreferencesStore(state => state.toggleShowValueSideList);
  const isModified = useModificationStore(state => state.isModified);

  const showEditValue = useDialogsStore(state => state.showModelEditValue);
  const hasValueDialog = activeCst &&
    !isBaseSet(activeCst.cst_type) &&
    isTypification(activeCst.analysis.type) &&
    (value != null || !isInferrable(activeCst.cst_type));

  function handleSetValue(newValue: Value | null) {
    if (newValue === null) {
      void engine.resetValue(activeCst!.id);
    } else {
      normalizeValue(newValue);
      void engine.setStructureValue(activeCst!.id, newValue);
    }
    onReset();
  }

  function handleEditValue() {
    if (!activeCst) {
      console.error('Invalid active cst');
      return;
    }
    showEditValue({
      initialValue: value,
      type: activeCst.analysis.type as Typification,
      engine: engine,
      onChange: !isInferrable(activeCst.cst_type) ? handleSetValue : undefined,
      getHeaderText: (path: TypePath) => getStructureName(schema, activeCst, path)
    });
  }

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      {isMutable ? (
        <MiniButton
          title='Сбросить несохраненные изменения'
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          onClick={onReset}
          disabled={!isModified || isProcessing}
        />
      ) : null}

      <MiniButton
        titleHtml='Вычислить текущую'
        aria-label='Вычислить текущую конституенту'
        icon={<IconCalculateOne size='1.25rem' className='icon-green' />}
        onClick={activeCst ? () => { engine.calculateCst(activeCst.id); } : undefined}
        disabled={isProcessing || !activeCst || isModified || !isInferrable(activeCst.cst_type)}
      />

      <MiniButton
        title='Просмотреть/Редактировать значение'
        icon={<IconDatabase size='1.25rem' className='icon-primary' />}
        onClick={handleEditValue}
        disabled={!hasValueDialog}
      />

      {isMutable ? <MiniButton
        title='Удалить значение текущей конституенты'
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        onClick={onClearValue}
        disabled={isProcessing || !activeCst || !hasValue || isInferrable(activeCst.cst_type)}
      /> : null}

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
      <BadgeHelp topic={HelpTopic.UI_RS_EDITOR} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
