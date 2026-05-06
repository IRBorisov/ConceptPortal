'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';

import { isAxiosError } from '@/backend/api-transport';
import { Tooltip } from '@/components/container';
import { Button, SubmitButton, TextURL } from '@/components/control';
import { IconHelp } from '@/components/icons';
import { type ErrorData } from '@/components/info-error';
import { Checkbox, TextInput } from '@/components/input';
import { PrettyJson } from '@/components/view';
import { globalIDs, patterns } from '@/utils/constants';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { schemaUserSignup, type UserSignupDTO } from '../../backend/types';
import { useSignup } from '../../backend/use-signup';

export function FormSignup() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { signup, isPending, error: serverError, reset: clearServerError } = useSignup();
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
      password2: '',
      email: '',
      first_name: '',
      last_name: ''
    } satisfies UserSignupDTO,
    validators: {
      onChange: schemaUserSignup
    },
    onSubmit: async ({ value }) => {
      await signup(value).then(createdUser =>
        router.pushAsync({ path: urls.login_hint(createdUser.username), force: true })
      );
    }
  });

  function resetErrors() {
    clearServerError();
  }

  function handleCancel() {
    if (router.canBack()) {
      router.back();
    } else {
      router.gotoLibrary();
    }
  }

  return (
    <form
      className='cc-column mx-auto w-xl px-6 py-3'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      onChange={resetErrors}
    >
      <h1 className='select-none font-math'>{tx('tx.general.user.new')}</h1>

      <div className='flex gap-12'>
        <fieldset className='cc-column w-60'>
          <legend className='sr-only'>{tx('tx.shell.signup.login.legend')}</legend>

          <form.Field name='username'>
            {field => (
              <TextInput
                id='username'
                autoComplete='username'
                label={tx('tx.general.username')}
                spellCheck={false}
                pattern={patterns.login}
                title={tx('tx.general.username.validate')}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
              />
            )}
          </form.Field>
          <form.Field name='password'>
            {field => (
              <TextInput
                id='password'
                type='password'
                autoComplete='new-password'
                label={tx('tx.general.password')}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
              />
            )}
          </form.Field>
          <form.Field name='password2'>
            {field => (
              <TextInput
                id='password2'
                type='password'
                autoComplete='new-password'
                label={tx('tx.general.password.repeat')}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
              />
            )}
          </form.Field>
        </fieldset>

        <fieldset className='cc-column w-60 relative'>
          <legend className='sr-only'>{tx('tx.shell.signup.profile.legend')}</legend>

          <IconHelp
            id={globalIDs.email_tooltip}
            className='absolute top-0 right-0 text-muted-foreground hover:text-primary cc-animate-color'
            size='1.25rem'
          />
          <Tooltip anchorSelect={`#${globalIDs.email_tooltip}`} offset={6}>
            {tx('tx.general.email.hint')}
          </Tooltip>
          <form.Field name='email'>
            {field => (
              <TextInput
                id='email'
                autoComplete='email'
                required
                spellCheck={false}
                label={tx('tx.general.email')}
                title={tx('tx.general.email.validate')}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
              />
            )}
          </form.Field>
          <form.Field name='first_name'>
            {field => (
              <TextInput
                id='first_name'
                autoComplete='given-name'
                label={tx('tx.general.firstName.public')}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
              />
            )}
          </form.Field>
          <form.Field name='last_name'>
            {field => (
              <TextInput
                id='last_name'
                autoComplete='family-name'
                label={tx('tx.general.lastName.public')}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
              />
            )}
          </form.Field>
        </fieldset>
      </div>

      <div className='flex gap-1 text-sm'>
        <Checkbox id='accept_terms' value={acceptPrivacy} onChange={setAcceptPrivacy} />
        <TextURL text={tx('tx.shell.signup.acceptPrivacy')} href={urls.help_topic(HelpTopic.INFO_PRIVACY)} />
      </div>
      <div className='flex gap-1 text-sm'>
        <Checkbox id='accept_rules' value={acceptRules} onChange={setAcceptRules} />
        <TextURL text={tx('tx.shell.signup.acceptRules')} href={urls.help_topic(HelpTopic.INFO_RULES)} />
      </div>

      <div className='flex justify-around mt-3'>
        <SubmitButton
          text={tx('tx.shell.signup')}
          className='min-w-40'
          loading={isPending}
          disabled={!acceptPrivacy || !acceptRules}
        />
        <Button text={tx('tx.general.goBack')} className='min-w-40' onClick={() => handleCancel()} />
      </div>
      {serverError ? <ServerError error={serverError} /> : null}
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
        <div className='mx-auto text-sm select-text text-destructive'>{error.response.data.email}</div>
      );
    } else if ('username' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='mx-auto text-sm select-text text-destructive'>{error.response.data.username}</div>
      );
    } else {
      return (
        <div className='mx-auto text-sm select-text text-destructive'>
          <PrettyJson data={error.response} />
        </div>
      );
    }
  }
  throw error as Error;
}
