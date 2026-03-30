'use client';

import { toast } from 'react-toastify';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';
import { getStructureName, isBaseSet } from '@/features/rsform/models/rsform-api';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { type TypePath, type Typification, type Value } from '@/features/rslang';
import { normalizeValue } from '@/features/rslang/eval/value-api';
import { isTypification } from '@/features/rslang/semantic/typification';

import { MiniButton } from '@/components/control';
import { IconCalculateAll, IconCalculateOne, IconDatabase, IconDestroy } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { prepareTooltip } from '@/utils/format';
import { errorMsg } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { useMutatingRSModel } from '../../../backend/use-mutating-rsmodel';
import { useCstValue } from '../../../hooks/use-cst-value';
import { type BasicBinding } from '../../../models/rsmodel';
import { isInferrable } from '../../../models/rsmodel-api';
import { useRSModelEdit } from '../rsmodel-context';

interface ToolbarValueTabProps {
  className?: string;
  isNarrow: boolean;
  onClearValue: () => void;
}

export function ToolbarValueTab({ className, isNarrow, onClearValue }: ToolbarValueTabProps) {
  const { isMutable, engine } = useRSModelEdit();
  const { activeCst, schema } = useRSFormEdit();
  const isProcessing = useMutatingRSModel();

  const value = useCstValue(engine, activeCst ?? null);
  const hasValue = value !== null;

  const showList = usePreferencesStore(state => state.showValueSideList);
  const toggleList = usePreferencesStore(state => state.toggleShowValueSideList);
  const isModified = useModificationStore(state => state.isModified);

  const showEditValue = useDialogsStore(state => state.showModelEditValue);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);
  const showEditBinding = useDialogsStore(state => state.showModelEditBinding);
  const hasValueDialog = activeCst &&
    isTypification(activeCst.analysis.type) &&
    (value != null || !isInferrable(activeCst.cst_type));

  function handleSetValue(newValue: Value | BasicBinding | null) {
    if (!activeCst) {
      console.error('Invalid active cst');
      return;
    }
    if (newValue === null) {
      void engine.resetValue(activeCst.id);
    } else if (isBaseSet(activeCst.cst_type)) {
      const binding = newValue as BasicBinding;
      void engine.setBasicValue(activeCst.id, binding);
    } else {
      normalizeValue(newValue as Value);
      void engine.setStructureValue(activeCst.id, newValue as Value);
    }
  }

  function handleValueDialog() {
    if (!activeCst) {
      console.error('Invalid active cst');
      return;
    }
    if (isBaseSet(activeCst.cst_type)) {
      showEditBinding({
        initialValue: engine.basics.get(activeCst.id) ?? {},
        onChange: isMutable ? handleSetValue : undefined
      });
      return;
    }
    const type = activeCst.analysis.type as Typification;
    const getHeaderText = (path: TypePath) => getStructureName(schema, activeCst, path);
    if (!isInferrable(activeCst.cst_type) && isMutable) {
      showEditValue({
        initialValue: value,
        type: type,
        engine: engine,
        onChange: handleSetValue,
        getHeaderText: getHeaderText
      });
    } else if (!value) {
      toast.error(errorMsg.valueNull);
    } else {
      showViewValue({
        value: value,
        type: type,
        engine: engine,
        getHeaderText: getHeaderText
      });
    }
  }

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      <MiniButton
        titleHtml={prepareTooltip('Вычислить текущую конституенту', isMac() ? 'Cmd + Q' : 'Ctrl + Q')}
        aria-label='Вычислить текущую конституенту'
        icon={<IconCalculateOne size='1.25rem' className='icon-green' />}
        onClick={activeCst ? () => { engine.calculateCst(activeCst.id); } : undefined}
        disabled={isProcessing || !activeCst || isModified || !isInferrable(activeCst.cst_type)}
      />

      <MiniButton
        title='Просмотреть/Редактировать значение'
        icon={<IconDatabase size='1.25rem' className='icon-primary' />}
        onClick={handleValueDialog}
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
        onClick={() => engine.recalculateAll()}
      />

      <MiniButton
        title='Отображение списка конституент'
        icon={<IconShowSidebar size='1.25rem' value={showList} isBottom={isNarrow} />}
        onClick={toggleList}
      />
      <BadgeHelp topic={HelpTopic.UI_RSMODEL_VALUE} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
