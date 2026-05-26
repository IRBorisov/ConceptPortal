'use client';

import { type Constituenta, CstType, type RSForm } from '@rsconcept/domain/library';
import { canProduceStructure } from '@rsconcept/domain/library/rsform-api';
import { useTx } from '@/i18n';

import { PillValueClass } from '@/features/rsform/components/pill-valueClass';

import { TextButton } from '@/components/control/text-button';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';

import { PillCrucial } from '../../../components/pill-crucial';
import { useSchemaEdit } from '../schema-edit-context';

export interface ConstituentaPrimaryActionsProps {
  className?: string;
  activeCst: Constituenta;
  schema: RSForm;
}

export function ConstituentaPrimaryActions({ className, activeCst, schema }: ConstituentaPrimaryActionsProps) {
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
  const showStructurePlanner = useDialogsStore(state => state.showStructurePlanner);
  const isModified = useModificationStore(state => state.isModified);

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
          text={tx('tx.concept.expandStructure')}
          title={tx('tx.concept.expandStructure.hint')}
          onClick={handleStructurePlanner}
          className='text-sm'
        />
      ) : null}
    </div>
  );
}
