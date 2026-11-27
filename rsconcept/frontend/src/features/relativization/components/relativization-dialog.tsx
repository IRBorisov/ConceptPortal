import { useEffect, useRef } from 'react';

import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { scheduleFocusRestore } from '@/features/onboarding/utils/focus';

import { ModalForm } from '@/components/modal';

export type RelativizationAction = 'preview' | 'save';

interface Props extends React.PropsWithChildren {
  reviewing: boolean;
  updating?: boolean;
  pending: RelativizationAction | null;
  canSubmit: boolean;
  hasEditedTexts: boolean;
  errorMessage: string;
  tourID?: string;
  returnFocusTo?: HTMLElement | null;
  beforeCancel: () => boolean;
  onHide: () => void;
  onSubmit: () => void;
  onSecondaryAction: () => void;
}

export function RelativizationDialog({
  reviewing,
  updating,
  pending,
  canSubmit,
  hasEditedTexts,
  errorMessage,
  tourID,
  returnFocusTo,
  beforeCancel,
  onHide,
  onSubmit,
  onSecondaryAction,
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

  const submitText = reviewing
    ? updating
      ? tx('tx.oss.relativization.review.update')
      : tx('tx.oss.relativization.review.submit')
    : updating
      ? tx('tx.oss.relativization.quick.update')
      : tx('tx.oss.relativization.quick.create');

  return (
    <ModalForm
      header={tx('tx.oss.relativization')}
      submitText={submitText}
      canSubmit={!pending && canSubmit}
      containFocus
      secondaryAction={{
        text: reviewing ? tx('tx.oss.relativization.review.back') : tx('tx.oss.relativization.review.start'),
        disabled: !!pending || (!reviewing && !canSubmit),
        onClick: onSecondaryAction
      }}
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
      className={`${reviewing ? 'w-224' : 'w-160'} max-w-[calc(100svw-1.5rem)] px-3 sm:px-5`}
      helpTopic={HelpTopic.CC_RELATIVIZATION}
      openManualInNewTab
      tourID={reviewing ? undefined : tourID}
    >
      <div ref={status} tabIndex={-1} role='status' aria-live='polite'>
        {pending ? (
          <p className='pt-3'>
            {tx(
              pending === 'preview' ? 'tx.oss.relativization.review.previewing' : 'tx.oss.relativization.review.saving'
            )}
          </p>
        ) : null}
      </div>
      {errorMessage ? (
        <p ref={error} tabIndex={-1} role='alert' className='pt-3 whitespace-pre-wrap text-destructive'>
          {errorMessage}
        </p>
      ) : null}
      {!reviewing && hasEditedTexts ? (
        <p className='pt-3 text-sm'>{tx('tx.oss.relativization.quick.edits.hint')}</p>
      ) : null}
      {children}
    </ModalForm>
  );
}
