'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'react-toastify';

import { useTx } from '@/i18n';

import { type ApiKeyCreatedDTO, type CreateApiKeyDTO } from '@/features/agents';
import { schemaCreateApiKey } from '@/features/agents/backend/types';
import { useApiKeys } from '@/features/agents/backend/use-api-keys';
import { useCreateApiKey } from '@/features/agents/backend/use-create-api-key';
import { useRevokeApiKey } from '@/features/agents/backend/use-revoke-api-key';

import { Button, SubmitButton } from '@/components/control';
import { TextInput } from '@/components/input';
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

  const form = useForm({
    defaultValues: { label: '' } satisfies CreateApiKeyDTO,
    validators: { onChange: schemaCreateApiKey },
    onSubmit: async ({ value, formApi }) => {
      const created = await createKey(value);
      setCreatedSecret(created);
      formApi.reset({ label: '' });
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
    <div className='cc-column w-full max-w-3xl px-4 py-2 gap-6'>
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
