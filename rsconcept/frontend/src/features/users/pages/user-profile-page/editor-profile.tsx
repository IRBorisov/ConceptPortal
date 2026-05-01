'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useTx } from '@/i18n';

import { useRegisterNavigationSave } from '@/app';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { TextInput } from '@/components/input';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { schemaUpdateProfile, type UpdateProfileDTO } from '../../backend/types';
import { useProfile } from '../../backend/use-profile';
import { useUpdateProfile } from '../../backend/use-update-profile';

export function EditorProfile() {
  const tx = useTx();
  const { profile } = useProfile();
  const { updateProfile, isPending, error: serverError, reset: clearServerError } = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email
    } satisfies UpdateProfileDTO,
    validators: {
      onChange: schemaUpdateProfile
    },
    onSubmit: async ({ value, formApi }) => {
      await updateProfile(value);
      formApi.reset(value);
    }
  });

  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);
  useRegisterNavigationSave(() => form.handleSubmit(), !isDefaultValue);

  const onResetEvent = useEffectEvent((next: UpdateProfileDTO) => {
    form.reset(next);
  });

  useEffect(
    function resetFormOnProfileChange() {
      onResetEvent({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      });
    },
    [profile.first_name, profile.last_name, profile.email]
  );

  function resetErrors() {
    clearServerError();
  }

  return (
    <form
      className='cc-column w-72 px-6 py-2'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      onChange={resetErrors}
    >
      <TextInput
        id='username'
        disabled
        label={tx('ui.profile.field.username', 'Username')}
        title={tx('ui.profile.field.usernameReadonlyTitle', 'Username cannot be changed')}
        value={profile.username}
      />
      <form.Field name='first_name'>
        {field => (
          <TextInput
            id='first_name'
            autoComplete='off'
            allowEnter
            label={tx('ui.users.column.firstName', 'First name')}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      <form.Field name='last_name'>
        {field => (
          <TextInput
            id='last_name'
            autoComplete='off'
            allowEnter
            label={tx('ui.users.column.lastName', 'Last name')}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      <form.Field name='email'>
        {field => (
          <TextInput
            id='email'
            autoComplete='off'
            allowEnter
            label={tx('ui.profile.field.email', 'Email')}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      {serverError ? <ServerError error={serverError} /> : null}
      <SubmitButton
        className='self-center mt-6'
        text={tx('ui.profile.submit.saveData', 'Save profile')}
        loading={isPending}
      />
    </form>
  );
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  rethrowIfStaleBundleError(error);

  if (isAxiosError(error) && error.response?.status === 400) {
    if ('email' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='text-sm select-text text-destructive'>{error.response.data.email}.</div>
      );
    }
  }
  throw error as Error;
}
