'use client';

import { type Constituenta, type RSForm } from '@/domain/library';
import { cstCanProduceStructure } from '@/domain/library/rsform-api';

import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { IconCrucial } from '@/components/icons';
import { cn } from '@/components/utils';
import { IndicatorPill } from '@/components/view/indicator-pill';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { tooltipText } from '@/utils/labels';

export function isConstituentaEditorDisabled(activeCst: Constituenta | null | undefined, isContentEditable: boolean) {
  return !activeCst || !isContentEditable;
}

export function canConstituentaOpenStructure(activeCst: Constituenta) {
  return !!activeCst.spawner_path || cstCanProduceStructure(activeCst);
}

export interface ConstituentaPrimaryActionsProps {
  className?: string;
  activeCst: Constituenta;
  schema: RSForm;
}

export function ConstituentaPrimaryActions({ className, activeCst, schema }: ConstituentaPrimaryActionsProps) {
  const {
    toggleCrucial, //
    patchConstituenta,
    createCstFromData,
    promptRename,
    isProcessing,
    isContentEditable
  } = useSchemaEdit();
  const showStructurePlanner = useDialogsStore(state => state.showStructurePlanner);
  const isModified = useModificationStore(state => state.isModified);

  const disabled = isConstituentaEditorDisabled(activeCst, isContentEditable);
  const crucial = activeCst.crucial;
  const canOpenStructure = canConstituentaOpenStructure(activeCst);

  const showCrucialPill = !disabled || crucial;
  const showRenameButton = !disabled;
  const showStructureButton = canOpenStructure;

  const hasPrimaryActions = showCrucialPill || showRenameButton || showStructureButton;
  if (!hasPrimaryActions) {
    return null;
  }

  function handleStructurePlanner() {
    showStructurePlanner({
      schema: schema,
      targetID: activeCst.spawner_path ? activeCst.spawner! : activeCst.id,
      isMutable: !disabled,
      onCreate: createCstFromData,
      onUpdate: patchConstituenta
    });
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-6', className)}>
      {showCrucialPill ? (
        <IndicatorPill
          className='text-sm font-controls py-0.5 gap-1 -mt-0.5'
          title={crucial ? 'Снять статус ключевой' : 'Добавить статус ключевой'}
          value={crucial ? 'ключевая' : 'обычная'}
          icon={<IconCrucial size='1rem' />}
          color={crucial ? 'teal' : 'muted'}
          onClick={toggleCrucial}
          disabled={disabled || isProcessing || isModified}
        />
      ) : null}

      {showRenameButton ? (
        <TextButton
          text='Переименовать'
          title={isModified ? tooltipText.unsaved : 'Переименовать конституенту'}
          onClick={promptRename}
          disabled={isModified}
          className='text-sm'
        />
      ) : null}

      {showStructureButton ? (
        <TextButton
          text='Раскрыть структуру'
          title='Управление структурой понятия'
          onClick={handleStructurePlanner}
          className='text-sm'
        />
      ) : null}
    </div>
  );
}
