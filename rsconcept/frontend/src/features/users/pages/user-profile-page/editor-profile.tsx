'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useBlockNavigation } from '@/app';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { TextInput } from '@/components/input';

import { type IUpdateProfileDTO, schemaUpdateProfile } from '../../backend/types';
import { useProfileSuspense } from '../../backend/use-profile';
import { useUpdateProfile } from '../../backend/use-update-profile';

export function EditorProfile() {
  const { profile } = useProfileSuspense();
  const { updateProfile, isPending, error: serverError, reset: clearServerError } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    clearErrors,
    reset: resetForm,
    formState: { errors, isDirty }
  } = useForm<IUpdateProfileDTO>({
    resolver: zodResolver(schemaUpdateProfile),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email
    },
    mode: 'onChange'
  });

  useBlockNavigation(isDirty);

  function resetErrors() {
    clearServerError();
    clearErrors();
  }

  function onSubmit(data: IUpdateProfileDTO) {
    return updateProfile(data).then(() => resetForm({ ...data }));
  }

  return (
    <form
      className='cc-column w-72 px-6 py-2'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <TextInput id='username' disabled label='Логин' title='Логин изменить нельзя' value={profile.username} />
      <TextInput
        id='first_name'
        {...register('first_name')}
        autoComplete='off'
        allowEnter
        label='Имя'
        error={errors.first_name}
      />
      <TextInput
        id='last_name'
        {...register('last_name')}
        autoComplete='off'
        allowEnter
        label='Фамилия'
        error={errors.last_name}
      />
      <TextInput
        id='email'
        {...register('email')}
        autoComplete='off'
        allowEnter
        label='Электронная почта'
        error={errors.email}
      />
      {serverError ? <ServerError error={serverError} /> : null}
      <SubmitButton className='self-center mt-6' text='Сохранить данные' loading={isPending} />
    </form>
  );
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
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
