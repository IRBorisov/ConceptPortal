'use client';

import { useState } from 'react';

import { useTx } from '@/i18n';

import { useAgentLogs } from '@/features/agents/backend/use-agent-logs';

import { IconPageFirst, IconPageLast, IconPageLeft, IconPageRight } from '@/components/icons';
import { cn } from '@/components/utils';

const PAGE_SIZE = 50;

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function TabAgentActivity() {
  const tx = useTx();
  const [offset, setOffset] = useState(0);
  const { logs, count } = useAgentLogs(offset);

  if (count === 0) {
    return <div className='px-4 py-6 text-sm text-muted-foreground'>{tx('tx.agents.log.empty')}</div>;
  }

  const start = offset + 1;
  const end = Math.min(count, offset + logs.length);
  const pageCount = Math.ceil(count / PAGE_SIZE);
  const pageIndex = Math.floor(offset / PAGE_SIZE);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < count;
  const buttonClass = cn(
    'cc-hover-text cc-animate-color',
    'focus-outline rounded-md',
    'disabled:opacity-75 not-[:disabled]:cursor-pointer'
  );

  return (
    <div className='w-full max-w-4xl px-4 py-2 overflow-x-auto'>
      <div className='mb-2 flex items-center justify-end text-sm text-muted-foreground select-none'>
        <span className='mr-2'>{tx('tx.shell.pagination.range', { start, end, total: count })}</span>
        {pageCount > 1 ? (
          <div className='flex'>
            <button
              type='button'
              aria-label={tx('tx.shell.pagination.first')}
              className={buttonClass}
              disabled={!canPrev}
              onClick={() => setOffset(0)}
            >
              <IconPageFirst size='1.5rem' />
            </button>
            <button
              type='button'
              aria-label={tx('tx.shell.pagination.prev')}
              className={buttonClass}
              disabled={!canPrev}
              onClick={() => setOffset(current => Math.max(0, current - PAGE_SIZE))}
            >
              <IconPageLeft size='1.5rem' />
            </button>
            <span className='px-1 tabular-nums'>
              {pageIndex + 1}/{pageCount}
            </span>
            <button
              type='button'
              aria-label={tx('tx.shell.pagination.next')}
              className={buttonClass}
              disabled={!canNext}
              onClick={() => setOffset(current => current + PAGE_SIZE)}
            >
              <IconPageRight size='1.5rem' />
            </button>
            <button
              type='button'
              aria-label={tx('tx.shell.pagination.last')}
              className={buttonClass}
              disabled={!canNext}
              onClick={() => setOffset((pageCount - 1) * PAGE_SIZE)}
            >
              <IconPageLast size='1.5rem' />
            </button>
          </div>
        ) : null}
      </div>
      <table className='w-full text-sm border-collapse'>
        <thead>
          <tr className='border-b text-left text-muted-foreground'>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.time')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.action')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.item')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.key')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.status')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.summary')}</th>
            <th className='py-2 font-medium'>{tx('tx.agents.log.request')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(row => (
            <tr key={row.id} className='border-b align-top'>
              <td className='py-2 pr-3 whitespace-nowrap'>{formatTimestamp(row.created_at)}</td>
              <td className='py-2 pr-3 font-mono text-xs'>{row.action}</td>
              <td className='py-2 pr-3'>
                {row.item_id != null ? (
                  <span>
                    {row.item_alias || `#${row.item_id}`}
                    {row.item_title ? (
                      <span className='block text-xs text-muted-foreground'>{row.item_title}</span>
                    ) : null}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className='py-2 pr-3'>
                {row.key_label || row.key_prefix ? (
                  <span>
                    {row.key_label}
                    {row.key_prefix ? (
                      <span className='block text-xs text-muted-foreground font-mono'>rcp_{row.key_prefix}_…</span>
                    ) : null}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className='py-2 pr-3'>{row.status_code}</td>
              <td className='py-2 pr-3'>{row.summary || '—'}</td>
              <td className='py-2 max-w-xs'>
                {row.request_text ? (
                  <pre className='max-h-24 overflow-auto whitespace-pre-wrap break-all font-mono text-xs'>
                    {row.request_text}
                  </pre>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
