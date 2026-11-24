import { Link } from 'react-router';

import { useTx } from '@/i18n';
import { type Operation } from '@rsconcept/domain/library';

import { urls } from '@/app';

import { collectRelativizations } from '../../../backend/relativization-passport';

interface ViewOssRelativizationsProps {
  operations: readonly Operation[];
}

function labelConstituent({ alias, term }: { alias: string; term: string }): string {
  return term ? `${alias} — ${term}` : alias;
}

export function ViewOssRelativizations({ operations }: ViewOssRelativizationsProps) {
  const tx = useTx();
  const relativizations = collectRelativizations(operations);

  if (relativizations.length === 0) {
    return null;
  }

  return (
    <details className='mt-3 rounded-md border bg-card px-3 py-2 text-sm'>
      <summary className='cursor-pointer font-medium'>{tx('tx.oss.relativization.schemas')}</summary>
      {relativizations.map(({ id, alias, title, result, relativization }) => (
        <dl key={id} className='mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t pt-2'>
          <dt className='text-muted-foreground'>{tx('tx.oss.relativization.result')}</dt>
          <dd>
            {result === null ? (
              tx('tx.operation.attachment.none')
            ) : (
              <Link className='underline' to={urls.schema(result)}>
                {[alias, title].filter(Boolean).join(' — ') || result}
              </Link>
            )}
          </dd>
          {relativization ? (
            <>
              <dt className='text-muted-foreground'>{tx('tx.oss.relocate.source')}</dt>
              <dd>
                <Link className='underline' to={urls.schema(relativization.source.id)}>
                  {[relativization.source.alias, relativization.source.title].filter(Boolean).join(' — ') ||
                    relativization.source.id}
                </Link>
              </dd>
              <dt className='text-muted-foreground'>{tx('tx.oss.relativization.target')}</dt>
              <dd>{labelConstituent(relativization.target)}</dd>
              <dt className='text-muted-foreground'>{tx('tx.oss.relativization.excluded')}</dt>
              <dd>
                {relativization.excluded.length > 0
                  ? relativization.excluded.map(labelConstituent).join(', ')
                  : tx('tx.oss.relativization.excluded.none')}
              </dd>
            </>
          ) : null}
        </dl>
      ))}
    </details>
  );
}
