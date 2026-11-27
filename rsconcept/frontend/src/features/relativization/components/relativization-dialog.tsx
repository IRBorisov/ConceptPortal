import { useEffect, useRef } from 'react';

import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { scheduleFocusRestore } from '@/features/onboarding/utils/focus';

import { ModalForm } from '@/components/modal';

interface Props extends React.PropsWithChildren {
  updating?: boolean;
  pending: boolean;
  canSubmit: boolean;
  errorMessage: string;
  tourID?: string;
  returnFocusTo?: HTMLElement | null;
  beforeCancel: () => boolean;
  onHide: () => void;
  onSubmit: () => void;
}

export function RelativizationDialog({
  updating,
  pending,
  canSubmit,
  errorMessage,
  tourID,
  returnFocusTo,
  beforeCancel,
  onHide,
  onSubmit,
  children
}: Props) {
  const tx = useTx();
  const error = useRef<HTMLParagraphElement>(null);
  const status = useRef<HTMLDivElement>(null);
  useEffect(
    function focusError() {
      if (errorMessage) error.current?.focus();
    },
    [errorMessage]
  );
  useEffect(
    function focusStatus() {
      if (pending) status.current?.focus();
    },
    [pending]
  );

  const submitText = tx(updating ? 'tx.general.save' : 'tx.general.create');

  return (
    <ModalForm
      header={tx('tx.oss.relativization')}
      submitText={submitText}
      canSubmit={!pending && canSubmit}
      containFocus
      beforeCancel={beforeCancel}
      canCancel={!pending}
      closeOnSubmit={false}
      onHide={onHide}
      onCancel={() => scheduleFocusRestore(returnFocusTo ?? null)}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        onSubmit();
      }}
      className='w-160 max-w-[calc(100svw-1.5rem)] px-3 sm:px-5'
      helpTopic={HelpTopic.CC_RELATIVIZATION}
      openManualInNewTab
      tourID={tourID}
    >
      <div ref={status} tabIndex={-1} role='status' aria-live='polite'>
        {pending ? <p className='pt-3'>{tx('tx.oss.relativization.saving')}</p> : null}
      </div>
      {errorMessage ? (
        <p ref={error} tabIndex={-1} role='alert' className='pt-3 whitespace-pre-wrap text-destructive'>
          {errorMessage}
        </p>
      ) : null}
      {children}
    </ModalForm>
  );
}
