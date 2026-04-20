'use client';

import { toast } from 'react-toastify';

import { type BasicBinding } from '@/domain/library';
import { getStructureName, isBaseSet } from '@/domain/library/rsform-api';
import { isInferrable } from '@/domain/library/rsmodel-api';
import { type TypePath, type Typification, type Value } from '@/domain/rslang';
import { normalizeValue } from '@/domain/rslang/eval/value-api';
import { isTypification } from '@/domain/rslang/semantic/typification';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { MiniButton } from '@/components/control';
import { IconCalculateAll, IconCalculateOne, IconDatabase, IconDestroy } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { prepareTooltip } from '@/utils/format';
import { errorMsg } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { useCstValue } from '../../../hooks/use-cst-value';
import { useRSModelEdit } from '../rsmodel-context';

interface ToolbarValueTabProps {
  className?: string;
  onClearValue: () => void;
}

export function ToolbarValueTab({ className, onClearValue }: ToolbarValueTabProps) {
  const { isMutable, engine } = useRSModelEdit();
  const { activeCst, schema, isProcessing } = useRSFormEdit();

  const value = useCstValue(engine, activeCst ?? null);
  const hasValue = value !== null;

  const isModified = useModificationStore(state => state.isModified);

  const showEditValue = useDialogsStore(state => state.showModelEditValue);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);
  const showEditBinding = useDialogsStore(state => state.showModelEditBinding);
  const hasValueDialog =
    activeCst && isTypification(activeCst.analysis.type) && (value != null || !isInferrable(activeCst.cst_type));

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
        onClick={
          activeCst
            ? () => {
                engine.calculateCst(activeCst.id);
              }
            : undefined
        }
        disabled={isProcessing || !activeCst || isModified || !isInferrable(activeCst.cst_type)}
      />

      <MiniButton
        title='Просмотреть/Редактировать значение'
        icon={<IconDatabase size='1.25rem' className='icon-primary' />}
        onClick={handleValueDialog}
        disabled={!hasValueDialog}
      />

      {isMutable ? (
        <MiniButton
          title='Удалить значение текущей конституенты'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          onClick={onClearValue}
          disabled={isProcessing || !activeCst || !hasValue || isInferrable(activeCst.cst_type)}
        />
      ) : null}

      <MiniButton
        titleHtml='Пересчитать модель'
        aria-label='Пересчитать все вычисления'
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={() => engine.recalculateAll()}
      />

      <BadgeHelp topic={HelpTopic.UI_MODEL_VALUE} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
