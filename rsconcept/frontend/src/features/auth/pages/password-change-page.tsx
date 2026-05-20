'use client';

import { type SubmitEvent, useLayoutEffect, useState } from 'react';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton } from '@/components/control';
import { type ErrorData, InfoError } from '@/components/info-error';
import { TextInput } from '@/components/input';
import { Loader } from '@/components/loader';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { useResetPassword } from '../backend/use-reset-password';

/** Survives React Strict Mode remount after stripping `?token=` from the address bar (dev only). */
const PASSWORD_RESET_TOKEN_STORAGE_KEY = 'rsconcept:password-reset-token-query';

function readResetToken(): string {
  const fromQuery = new URLSearchParams(window.location.search).get('token') ?? '';
  if (fromQuery) {
    return fromQuery;
  }
  try {
    return sessionStorage.getItem(PASSWORD_RESET_TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function useTokenValidation(token: string, isPending: boolean) {
  const { validateToken } = useResetPassword();
  const [isTokenValidating, setIsTokenValidating] = useState(false);

  const validate = async () => {
    if (!isTokenValidating && !isPending) {
      setIsTokenValidating(true);
      await validateToken({ token });
    }
  };
  return { isTokenValidating, validate };
}

export function Component() {
  const tx = useTx();
  const router = useConceptNavigation();
  const [resetToken] = useState(() => readResetToken());

  useLayoutEffect(
    function stripResetTokenQuery() {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('token')) {
        return;
      }
      const raw = url.searchParams.get('token') ?? '';
      try {
        if (raw) {
          sessionStorage.setItem(PASSWORD_RESET_TOKEN_STORAGE_KEY, raw);
        }
      } catch {
        // ignore quota / privacy mode
      }
      url.searchParams.delete('token');
      const search = url.searchParams.toString();
      const nextPath = `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
      router.replace({ path: nextPath, force: true });
    },
    [router]
  );

  const { resetPassword, isPending, error: serverError } = useResetPassword();
  const { isTokenValidating, validate } = useTokenValidation(resetToken, isPending);

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
        try {
          sessionStorage.removeItem(PASSWORD_RESET_TOKEN_STORAGE_KEY);
        } catch {
          // ignore
        }
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
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  const tx = useTx();
  rethrowIfStaleBundleError(error);

  if (isAxiosError(error) && error.response?.status === 404) {
    return (
      <div className='mx-auto mt-6 text-sm select-text text-destructive'>
        {tx('tx.shell.auth.restore.token.validation')}
      </div>
    );
  }
  return <InfoError error={error} />;
}
