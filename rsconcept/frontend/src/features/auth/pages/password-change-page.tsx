'use client';

import { type SubmitEvent, useEffect, useState } from 'react';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton } from '@/components/control';
import { type ErrorData, InfoError } from '@/components/info-error';
import { TextInput } from '@/components/input';
import { Loader } from '@/components/loader';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { useResetPassword } from '../backend/use-reset-password';
import { captureResetTokenFromUrl, clearResetToken, readResetToken } from '../models/password-reset-token';

function useTokenValidation(token: string, isPending: boolean) {
  const { validateToken, error } = useResetPassword();
  const [isTokenValidating, setIsTokenValidating] = useState(false);

  const validate = async () => {
    if (!isTokenValidating && !isPending) {
      setIsTokenValidating(true);
      try {
        await validateToken({ token });
      } catch (error) {
        // Only a definitive invalid / expired response drops the token; transient network or
        // server failures keep it so a reload can retry validation.
        if (isInvalidTokenError(error)) {
          clearResetToken();
        }
      }
    }
  };
  return { isTokenValidating, validate, error };
}

export function Component() {
  const tx = useTx();
  const router = useConceptNavigation();
  const [resetToken] = useState(() => {
    // main.tsx already stripped the URL before Sentry; this covers in-app navigation (e.g. HMR).
    captureResetTokenFromUrl();
    return readResetToken();
  });

  useEffect(function forgetResetTokenOnLeave() {
    // Token lives in component state; storage only needs to survive a reload while on this page.
    return clearResetToken;
  }, []);

  const { resetPassword, isPending, error: resetError } = useResetPassword();
  const { isTokenValidating, validate, error: validationError } = useTokenValidation(resetToken, isPending);
  const serverError = resetError ?? validationError;

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const canSubmit = !!newPassword && !!newPasswordRepeat && newPassword === newPasswordRepeat;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      void resetPassword({
        password: newPassword,
        token: resetToken
      }).then(() => {
        clearResetToken();
        router.replace({ path: urls.login });
      });
    }
  }

  if (!isTokenValidating && !isPending) {
    void validate();
  }

  if (isPending) {
    return <Loader />;
  }

  return (
    <form className='cc-fade-in cc-column w-96 mx-auto px-6 mt-3' onSubmit={handleSubmit}>
      <TextInput
        id='new_password'
        type='password'
        label={tx('tx.general.password.new')}
        autoComplete='new-password'
        allowEnter
        value={newPassword}
        onChange={event => {
          setNewPassword(event.target.value);
        }}
      />
      <TextInput
        id='new_password_repeat'
        type='password'
        label={tx('tx.general.password.repeat')}
        autoComplete='new-password'
        allowEnter
        value={newPasswordRepeat}
        onChange={event => {
          setNewPasswordRepeat(event.target.value);
        }}
      />
      {newPasswordRepeat && newPassword !== newPasswordRepeat ? (
        <div className='text-sm text-destructive'>{tx('tx.general.password.repeat.validate')}</div>
      ) : null}

      <SubmitButton
        text={tx('tx.general.password.submit')}
        className='self-center w-48 mt-3'
        loading={isPending}
        disabled={!canSubmit}
      />
      {serverError ? <ServerError error={serverError} /> : null}
    </form>
  );
}

// ====== Internals =========
/** Backend answers 404 for an unknown or expired reset token. */
function isInvalidTokenError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  const tx = useTx();
  rethrowIfStaleBundleError(error);

  if (isInvalidTokenError(error)) {
    return (
      <div className='mx-auto mt-6 text-sm select-text text-destructive'>
        {tx('tx.shell.auth.restore.token.validation')}
      </div>
    );
  }
  return <InfoError error={error} />;
}
