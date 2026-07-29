'use client';

import { useTx } from '@/i18n';

import { useAgentLogs } from '@/features/agents/backend/use-agent-logs';

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function TabAgentActivity() {
  const tx = useTx();
  const { logs } = useAgentLogs();

  if (logs.length === 0) {
    return <div className='px-4 py-6 text-sm text-muted-foreground'>{tx('tx.agents.log.empty')}</div>;
  }

  return (
    <div className='w-full max-w-4xl px-4 py-2 overflow-x-auto'>
      <table className='w-full text-sm border-collapse'>
        <thead>
          <tr className='border-b text-left text-muted-foreground'>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.time')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.action')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.item')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.key')}</th>
            <th className='py-2 pr-3 font-medium'>{tx('tx.agents.log.status')}</th>
            <th className='py-2 font-medium'>{tx('tx.agents.log.summary')}</th>
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
              <td className='py-2'>{row.summary || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
