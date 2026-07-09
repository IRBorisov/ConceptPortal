'use client';

import { useTx } from '@/i18n';
import { type Constituenta, CstType, type RSForm } from '@rsconcept/domain/library';
import { canProduceStructure } from '@rsconcept/domain/library/rsform-api';

import { type UnsavedSaveHandler, useUnsavedChanges } from '@/app';
import { PillValueClass } from '@/features/rsform/components/pill-valueClass';

import { TextButton } from '@/components/control/text-button';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';

import { PillCrucial } from '../../../components/pill-crucial';
import { useRsformDialogsStore } from '../../../dialogs/rsform-dialog-store';
import { useSchemaEdit } from '../schema-edit-context';

export interface ConstituentaPrimaryActionsProps {
  className?: string;
  activeCst: Constituenta;
  schema: RSForm;
  onSaveUnsaved?: UnsavedSaveHandler;
}

export function ConstituentaPrimaryActions({
  className,
  activeCst,
  schema,
  onSaveUnsaved
}: ConstituentaPrimaryActionsProps) {
  const tx = useTx();
  const {
    toggleCrucial, //
    toggleValueClass,
    patchConstituenta,
    createCstFromData,
    promptRename,
    isProcessing,
    isContentEditable
  } = useSchemaEdit();
  const showStructurePlanner = useRsformDialogsStore(state => state.showStructurePlanner);
  const isModified = useModificationStore(state => state.isModified);
  const { promptUnsaved } = useUnsavedChanges();

  const disabled = !activeCst || !isContentEditable;
  const crucial = activeCst.crucial;
  const canOpenStructure = !!activeCst.spawner_path || canProduceStructure(activeCst);

  const showCrucialPill = !disabled || crucial;
  const showRenameButton = !disabled;
  const showStructureButton = canOpenStructure;

  const isProperty = activeCst.value_is_property;
  const showValueClassPill =
    activeCst.cst_type === CstType.BASE ||
    activeCst.cst_type === CstType.CONSTANT ||
    activeCst.cst_type === CstType.STRUCTURED;

  const hasPrimaryActions = showCrucialPill || showRenameButton || showStructureButton || showValueClassPill;
  if (!hasPrimaryActions) {
    return null;
  }

  function openStructurePlanner() {
    showStructurePlanner({
      schema: schema,
      targetID: activeCst.spawner_path ? activeCst.spawner! : activeCst.id,
      isMutable: !disabled,
      onCreate: createCstFromData,
      onUpdate: patchConstituenta
    });
  }

  function handleStructurePlanner() {
    if (isModified) {
      void promptUnsaved({
        onSave: onSaveUnsaved,
        onConfirm: openStructurePlanner
      });
    } else {
      openStructurePlanner();
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-6', className)}>
      {showCrucialPill || showValueClassPill ? (
        <div className='flex gap-3'>
          {showCrucialPill ? (
            <PillCrucial
              value={crucial}
              toggleValue={toggleCrucial}
              disabled={disabled || isProcessing || isModified}
            />
          ) : null}

          {showValueClassPill ? (
            <PillValueClass
              value={!isProperty}
              toggleValue={toggleValueClass}
              disabled={disabled || isProcessing || isModified || activeCst.is_inherited}
            />
          ) : null}
        </div>
      ) : null}

      {showRenameButton ? (
        <TextButton
          text={tx('tx.general.rename')}
          title={isModified ? tx('tx.general.changes.unsaved.hint') : tx('tx.cst.rename')}
          onClick={promptRename}
          disabled={isModified}
          className='text-sm'
        />
      ) : null}

      {showStructureButton ? (
        <TextButton
          data-tour='concept-structure'
          text={tx('tx.concept.expandStructure')}
          title={tx('tx.concept.expandStructure.hint')}
          onClick={handleStructurePlanner}
          className='text-sm'
        />
      ) : null}
    </div>
  );
}
