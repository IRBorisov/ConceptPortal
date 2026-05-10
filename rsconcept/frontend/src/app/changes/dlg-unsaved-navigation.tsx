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
      className='z-topmost max-w-[calc(100svw-2rem)] flex flex-col px-6 pb-3'
      noFooterButton
      onHide={onCancel}
    >
      <div className='grid grid-cols-3 gap-6 py-1'>
        {onSaveAndContinue ? (
          <Button text={tx('tx.general.save')} disabled={isSaving} onClick={onSaveAndContinue} colorSubmit />
        ) : null}
        <Button text={tx('tx.general.goBack')} onClick={onCancel} disabled={isSaving} />
        <Button text={tx('tx.general.discard')} onClick={onContinue} disabled={isSaving} />
      </div>
    </ModalView>
  );
}
