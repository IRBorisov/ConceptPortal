'use client';

import { useForm } from '@tanstack/react-form';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';
import { type IChangePasswordDTO, schemaChangePassword } from '@/features/auth';
import { useChangePassword } from '@/features/auth/backend/use-change-password';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { TextInput } from '@/components/input';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

export function EditorPassword() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { changePassword, isPending, error: serverError, reset: clearServerError } = useChangePassword();

  const form = useForm({
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password2: ''
    } satisfies IChangePasswordDTO,
    validators: {
      onChange: schemaChangePassword
    },
    onSubmit: async ({ value }) => {
      await changePassword(value).then(() => router.pushAsync({ path: urls.login, force: true }));
    }
  });

  function resetErrors() {
    clearServerError();
  }

  return (
    <form
      className='max-w-64 px-6 py-2 flex flex-col gap-2 justify-between border-l-2'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      onChange={resetErrors}
    >
      <div className='cc-column'>
        <form.Field name='old_password'>
          {field => (
            <TextInput
              id='old_password'
              type='password'
              autoComplete='current-password'
              label={tx('tx.general.password.current')}
              allowEnter
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <form.Field name='new_password'>
          {field => (
            <TextInput
              id='new_password'
              type='password'
              autoComplete='new-password'
              label={tx('tx.general.password.new')}
              allowEnter
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <form.Field name='new_password2'>
          {field => (
            <TextInput
              id='new_password2'
              type='password'
              autoComplete='new-password'
              label={tx('tx.general.password.repeat')}
              allowEnter
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        {serverError ? (
          <ServerError error={serverError} wrongOldPasswordLabel={tx('tx.general.password.invalid')} />
        ) : null}
      </div>
      <SubmitButton text={tx('tx.general.password.submit')} className='self-center' loading={isPending} />
    </form>
  );
}

// ====== Internals =========
function ServerError({
  error,
  wrongOldPasswordLabel
}: {
  error: ErrorData;
  wrongOldPasswordLabel: string;
}): React.ReactElement {
  rethrowIfStaleBundleError(error);

  if (isAxiosError(error) && error.response?.status === 400) {
    return <div className='text-sm select-text text-destructive'>{wrongOldPasswordLabel}</div>;
  }
  throw error as Error;
}
