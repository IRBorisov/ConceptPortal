'use client';

import { useTx } from '@/i18n';
import { usePdfExportProgressStore } from '@/services/pdf/export-progress';

import { MiniButton } from '@/components/control';
import { IconClose, IconPDF } from '@/components/icons';
import { ModalPortal } from '@/components/modal/modal-portal';
import { useEscapeKey } from '@/hooks/use-escape-key';

/**
 * Non-blocking floating status while a PDF worker (or main-thread fallback) is rendering.
 *
 * Cancel / Escape terminates the worker via {@link usePdfExportProgressStore}.
 */
export function PdfExportOverlay() {
  const tx = useTx();
  const isActive = usePdfExportProgressStore(state => state.activeCount > 0);
  const cancel = usePdfExportProgressStore(state => state.cancel);
  const label = tx('tx.general.download.pdf.progress');

  useEscapeKey(cancel, isActive);

  if (!isActive) {
    return null;
  }

  return (
    <ModalPortal>
      <div className='pointer-events-none fixed inset-x-0 bottom-5 z-modal flex justify-center px-4 cc-fade-in'>
        <div
          role='status'
          aria-busy='true'
          aria-live='polite'
          aria-label={label}
          className='pointer-events-auto flex w-full max-w-xs flex-col gap-2 rounded-xl border bg-card px-3 py-2.5 cc-shadow-border'
        >
          <div className='grid grid-cols-[2rem_1fr_2rem] items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary'>
              <IconPDF size='1.15rem' aria-hidden />
            </div>
            <p className='truncate text-center text-sm font-medium text-foreground'>{label}</p>
            <MiniButton
              noPadding
              className='justify-self-end p-1 hover:text-destructive'
              title={tx('tx.general.cancel')}
              icon={<IconClose size='1.15rem' />}
              onClick={cancel}
            />
          </div>
          <div
            className='h-1 overflow-hidden rounded-full bg-secondary'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
          >
            <div className='h-full w-2/5 rounded-full bg-primary animate-indeterminate-bar' />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
