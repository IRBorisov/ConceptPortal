'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from '@tanstack/react-form';

import { useTx } from '@/i18n';

import { type ApiKeyCreatedDTO, type ApiKeyScope, type CreateApiKeyDTO } from '@/features/agents';
import { schemaCreateApiKey } from '@/features/agents/backend/types';
import { useApiKeys } from '@/features/agents/backend/use-api-keys';
import { useCreateApiKey } from '@/features/agents/backend/use-create-api-key';
import { useRevokeApiKey } from '@/features/agents/backend/use-revoke-api-key';

import { Button, SubmitButton } from '@/components/control';
import { Checkbox, TextInput } from '@/components/input';
import { cn } from '@/components/utils';

function formatTimestamp(value: string | null, neverLabel: string): string {
  if (!value) {
    return neverLabel;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function TabApiKeys() {
  const tx = useTx();
  const { keys } = useApiKeys();
  const { createKey, isPending } = useCreateApiKey();
  const { revokeKey, isPending: isRevoking } = useRevokeApiKey();
  const [createdSecret, setCreatedSecret] = useState<ApiKeyCreatedDTO | null>(null);

  const [expiryDays, setExpiryDays] = useState('90');
  const initialValues = { label: '', scopes: ['read'] as ApiKeyScope[] } satisfies CreateApiKeyDTO;
  const scopeLabels: Record<ApiKeyScope, string> = {
    read: tx('tx.agents.key.scope.read'),
    write: tx('tx.agents.key.scope.write'),
    publish: tx('tx.agents.key.scope.publish')
  };

  const form = useForm({
    defaultValues: initialValues,
    validators: { onChange: schemaCreateApiKey },
    onSubmit: async ({ value, formApi }) => {
      const expires_at =
        expiryDays === 'never' ? null : new Date(Date.now() + Number(expiryDays) * 86400000).toISOString();
      const created = await createKey({ ...value, expires_at });
      setCreatedSecret(created);
      formApi.reset(initialValues);
    }
  });

  function handleCopy(secret: string) {
    void navigator.clipboard.writeText(secret).then(
      () => toast.success(tx('tx.general.copy.toClipboard.success')),
      () => toast.error(tx('tx.general.copy.toClipboard.fail'))
    );
  }

  async function handleRevoke(id: number) {
    if (!window.confirm(tx('tx.agents.key.revoke.confirm'))) {
      return;
    }
    await revokeKey(id);
  }

  return (
    <div className='cc-column w-full max-w-3xl mx-auto px-4 py-2 gap-6'>
      <p className='text-sm text-muted-foreground'>{tx('tx.agents.key.limits')}</p>
      <form
        className='cc-column gap-3'
        onSubmit={event => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name='label'>
          {field => (
            <TextInput
              id='api_key_label'
              label={tx('tx.agents.key.label')}
              title={tx('tx.agents.key.label.hint')}
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <form.Field name='scopes'>
          {field => (
            <fieldset className='cc-column gap-2'>
              <legend className='text-sm font-medium'>{tx('tx.agents.key.scopes')}</legend>
              <p className='text-sm text-muted-foreground'>{tx('tx.agents.key.scopes.hint')}</p>
              {(['read', 'write', 'publish'] as const).map(scope => (
                <Checkbox
                  key={scope}
                  label={scopeLabels[scope]}
                  value={field.state.value.includes(scope)}
                  onChange={checked =>
                    field.handleChange(
                      checked ? [...field.state.value, scope] : field.state.value.filter(value => value !== scope)
                    )
                  }
                />
              ))}
              {field.state.meta.errors.length ? (
                <p role='alert' className='text-sm text-destructive'>
                  {tx('tx.agents.key.scopes.required')}
                </p>
              ) : null}
            </fieldset>
          )}
        </form.Field>
        <label className='cc-column gap-1 text-sm'>
          {tx('tx.agents.key.expiry')}
          <select
            className='self-start rounded border bg-input px-2 py-2'
            value={expiryDays}
            onChange={event => setExpiryDays(event.target.value)}
          >
            {[7, 30, 90].map(days => (
              <option key={days} value={days}>
                {tx('tx.agents.key.expiry.days', { days })}
              </option>
            ))}
            <option value='never'>{tx('tx.agents.key.expiry.none')}</option>
          </select>
        </label>
        <SubmitButton className='self-start' text={tx('tx.agents.key.create')} loading={isPending} />
      </form>

      {createdSecret ? (
        <div className='rounded border border-destructive/40 bg-destructive/5 px-4 py-3 cc-column gap-2'>
          <div className='font-semibold'>{tx('tx.agents.key.secret.title')}</div>
          <p className='text-sm text-muted-foreground'>{tx('tx.agents.key.secret.hint')}</p>
          <code className='block break-all rounded bg-background px-2 py-2 text-sm select-all'>
            {createdSecret.secret}
          </code>
          <div className='flex gap-2'>
            <Button text={tx('tx.agents.key.secret.copy')} onClick={() => handleCopy(createdSecret.secret)} />
            <Button text={tx('tx.general.close')} onClick={() => setCreatedSecret(null)} />
          </div>
        </div>
      ) : null}

      <div className='cc-column gap-2'>
        <h2 className='text-lg font-semibold'>{tx('tx.agents.key.list')}</h2>
        {keys.length === 0 ? (
          <p className='text-sm text-muted-foreground'>{tx('tx.agents.key.empty')}</p>
        ) : (
          <ul className='divide-y border rounded'>
            {keys.map(key => (
              <li key={key.id} className={cn('flex flex-wrap items-center justify-between gap-3 px-3 py-3')}>
                <div className='cc-column gap-0.5 min-w-0'>
                  <div className='font-medium truncate'>{key.label}</div>
                  <div className='text-xs text-muted-foreground'>
                    {tx('tx.agents.key.prefix')}: <code>rcp_{key.prefix}_…</code>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {tx('tx.agents.key.created')}: {formatTimestamp(key.created_at, '—')}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {tx('tx.agents.key.scopes')}: {key.scopes.map(scope => scopeLabels[scope]).join(', ')}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {tx('tx.agents.key.expiry')}: {formatTimestamp(key.expires_at, tx('tx.agents.key.expiry.none'))}
                    {!key.is_active ? ` · ${tx('tx.agents.key.expiry.expired')}` : ''}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {tx('tx.agents.key.lastUsed')}: {formatTimestamp(key.last_used_at, tx('tx.agents.key.neverUsed'))}
                  </div>
                </div>
                <Button
                  text={tx('tx.agents.key.revoke')}
                  disabled={isRevoking}
                  onClick={() => void handleRevoke(key.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
