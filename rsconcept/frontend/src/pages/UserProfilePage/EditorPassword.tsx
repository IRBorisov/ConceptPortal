'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { ChangePasswordSchema, IChangePasswordDTO } from '@/backend/auth/api';
import { useChangePassword } from '@/backend/auth/useChangePassword';
import { ErrorData } from '@/components/info/InfoError';
import FlexColumn from '@/components/ui/FlexColumn';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';

function EditorPassword() {
  const router = useConceptNavigation();
  const { changePassword, isPending, error: serverError, reset } = useChangePassword();
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<IChangePasswordDTO>({
    resolver: zodResolver(ChangePasswordSchema)
  });

  function resetErrors() {
    reset();
    clearErrors();
  }

  function onSubmit(data: IChangePasswordDTO) {
    changePassword(data, () => router.push(urls.login));
  }

  return (
    <form
      className={clsx('max-w-[16rem]', 'px-6 py-2 flex flex-col justify-between', 'border-l-2')}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <FlexColumn>
        <TextInput
          id='old_password'
          type='password'
          {...register('old_password')}
          label='Старый пароль'
          autoComplete='current-password'
          allowEnter
          error={errors.old_password}
        />
        <TextInput
          id='new_password'
          type='password'
          {...register('new_password')}
          label='Новый пароль'
          autoComplete='new-password'
          allowEnter
          error={errors.new_password}
        />
        <TextInput
          id='new_password2'
          type='password'
          {...register('new_password2')}
          label='Повторите новый'
          autoComplete='new-password'
          allowEnter
          error={errors.new_password2}
        />
        {serverError ? <ServerError error={serverError} /> : null}
      </FlexColumn>
      <SubmitButton text='Сменить пароль' className='self-center mt-2' loading={isPending} />
    </form>
  );
}

export default EditorPassword;

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return <div className='text-sm select-text text-warn-600'>Неверно введен старый пароль</div>;
  }
  throw error as Error;
}
