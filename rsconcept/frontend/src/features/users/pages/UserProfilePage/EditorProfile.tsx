'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useBlockNavigation } from '@/app';

import { isAxiosError } from '@/backend/apiTransport';
import { SubmitButton } from '@/components/Control';
import { ErrorData } from '@/components/InfoError';
import { TextInput } from '@/components/Input';

import { IUpdateProfileDTO, schemaUpdateProfile } from '../../backend/types';
import { useProfileSuspense } from '../../backend/useProfile';
import { useUpdateProfile } from '../../backend/useUpdateProfile';

function EditorProfile() {
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
    }
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
      className='cc-column w-[18rem] px-6 py-2'
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

export default EditorProfile;

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (isAxiosError(error) && error.response && error.response.status === 400) {
    if ('email' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='text-sm select-text text-warn-600'>{error.response.data.email}.</div>
      );
    }
  }
  throw error as Error;
}
