'use client';

import { useTx } from '@/i18n';

import { Button } from '@/components/control';
import { ModalView } from '@/components/modal';

interface DlgUnsavedNavigationProps {
  open: boolean;
  canSave: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onContinue: () => void;
  onSaveAndContinue: () => void;
}

export function DlgUnsavedNavigation({
  open,
  canSave,
  isSaving,
  onCancel,
  onContinue,
  onSaveAndContinue
}: DlgUnsavedNavigationProps) {
  const tx = useTx();
  if (!open) {
    return null;
  }

  return (
    <ModalView
      header={tx('dlg.unsaved.header', 'You have unsaved changes')}
      className='cc-column w-120 max-w-[calc(100svw-2rem)] gap-3 px-6 pb-4'
      noFooterButton
      onHide={onCancel}
    >
      <p>{tx('dlg.unsaved.body', 'Continue navigating without saving your changes?')}</p>
      <div className='flex flex-wrap gap-3 justify-center'>
        <Button text={tx('dlg.unsaved.cancel', 'Cancel')} className='w-40' onClick={onCancel} disabled={isSaving} />
        <Button text={tx('dlg.unsaved.continue', 'Continue without saving')} onClick={onContinue} disabled={isSaving} />
        <Button
          text={tx('dlg.unsaved.saveContinue', 'Save and continue')}
          colorSubmit
          loading={isSaving}
          disabled={!canSave || isSaving}
          onClick={onSaveAndContinue}
        />
      </div>
    </ModalView>
  );
}
