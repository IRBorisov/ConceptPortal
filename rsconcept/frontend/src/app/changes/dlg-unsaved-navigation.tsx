'use client';

import { useTx } from '@/i18n';

import { Button } from '@/components/control';
import { ModalView } from '@/components/modal';

interface DlgUnsavedChangesProps {
  open: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onContinue: () => void;
  onSaveAndContinue?: () => void;
}

export function DlgUnsavedChanges({ open, isSaving, onCancel, onContinue, onSaveAndContinue }: DlgUnsavedChangesProps) {
  const tx = useTx();
  if (!open) {
    return null;
  }

  return (
    <ModalView
      header={tx('tx.shell.unsaved.header')}
      className='z-topmost cc-column w-120 max-w-[calc(100svw-2rem)] gap-3 px-6 pb-4'
      noFooterButton
      onHide={onCancel}
    >
      <div className='grid gap-3 justify-center mx-auto'>
        <Button text={tx('tx.general.cancel')} className='w-80' onClick={onCancel} disabled={isSaving} />
        <Button text={tx('tx.shell.unsaved.continue')} onClick={onContinue} disabled={isSaving} />
        {onSaveAndContinue ? (
          <Button text={tx('tx.shell.unsaved.saveContinue')} disabled={isSaving} onClick={onSaveAndContinue} />
        ) : null}
      </div>
    </ModalView>
  );
}
