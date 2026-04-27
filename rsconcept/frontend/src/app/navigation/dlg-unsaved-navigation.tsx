'use client';

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
  if (!open) {
    return null;
  }

  return (
    <ModalView
      header='Есть несохраненные изменения'
      className='cc-column w-120 max-w-[calc(100svw-2rem)] gap-3 px-6 pb-4'
      noFooterButton
      onHide={onCancel}
    >
      <p>Продолжить навигацию без сохранения изменений?</p>
      <div className='flex flex-wrap gap-3 justify-center'>
        <Button text='Отмена' className='w-40' onClick={onCancel} disabled={isSaving} />
        <Button text='Продолжить без сохранения' onClick={onContinue} disabled={isSaving} />
        <Button
          text='Сохранить и продолжить'
          colorSubmit
          loading={isSaving}
          disabled={!canSave || isSaving}
          onClick={onSaveAndContinue}
        />
      </div>
    </ModalView>
  );
}
