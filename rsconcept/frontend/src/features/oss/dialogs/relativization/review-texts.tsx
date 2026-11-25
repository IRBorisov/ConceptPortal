import { useTx } from '@/i18n';

import { Button } from '@/components/control';
import { Checkbox, TextArea } from '@/components/input';

import { isReviewed, type ReviewRow, type TextField, textFields } from './review';

const labels: Record<TextField, string> = {
  term_raw: 'tx.oss.relativization.review.term',
  definition_raw: 'tx.lib.defineText',
  convention: 'tx.lib.convention'
};

interface Props {
  rows: ReviewRow[];
  onChange: (row: ReviewRow) => void;
  back: () => void;
  disabled: boolean;
}

export function ReviewRelativizationTexts({ rows, onChange, back, disabled }: Props) {
  const tx = useTx();
  const total = rows.filter(row => row.proposal.inKernel).length;
  const completed = rows.filter(row => row.proposal.inKernel && isReviewed(row)).length;

  return (
    <div className='cc-column gap-3 py-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <Button text={tx('tx.oss.relativization.review.back')} onClick={back} disabled={disabled} />
        <span aria-live='polite'>{tx('tx.oss.relativization.review.progress', { completed, total })}</span>
      </div>
      <fieldset disabled={disabled} className='cc-column gap-2'>
        {rows.map(row => {
          const { proposal, item, fields } = row;
          return (
            <details
              key={item.id}
              className='rounded border border-border px-3 py-2'
              onToggle={event => {
                if (event.currentTarget.open && !row.visited) onChange({ ...row, visited: true });
              }}
            >
              <summary className='cursor-pointer'>
                {proposal.sourceAlias ? proposal.sourceAlias + ' → ' : ''}
                {item.alias} · {fields.term_raw || tx('tx.oss.relativization.review.empty')}{' '}
                {proposal.inKernel
                  ? ' · ' +
                    tx(
                      isReviewed(row)
                        ? 'tx.oss.relativization.review.reviewed'
                        : 'tx.oss.relativization.review.required'
                    )
                  : ''}
              </summary>
              <div className='cc-column gap-2 py-2'>
                <p>
                  {tx('tx.oss.relativization.review.types')}{' '}
                  <code>
                    {proposal.beforeType || '∅'} → {proposal.afterType || '∅'}
                  </code>
                </p>
                {proposal.formalInvalid ? <p role='alert'>{tx('tx.oss.relativization.review.invalid')}</p> : null}
                <section className='cc-column gap-1'>
                  <h2 className='font-semibold'>{tx('tx.oss.relativization.review.origins')}</h2>
                  {proposal.component ? (
                    <p>
                      {proposal.component.source} · {proposal.component.path.join('.')} · {proposal.component.term} ·{' '}
                      {tx(
                        proposal.component.scope === 'context'
                          ? 'tx.oss.relativization.review.context'
                          : 'tx.oss.relativization.review.value'
                      )}
                    </p>
                  ) : null}
                  {proposal.coordinates.map(coordinate => (
                    <p key={coordinate.scope}>
                      {coordinate.path.join('.')} ·{' '}
                      {tx(
                        coordinate.scope === 'context'
                          ? 'tx.oss.relativization.review.context'
                          : 'tx.oss.relativization.review.value'
                      )}
                      {coordinate.label ? ' · ' + coordinate.label : ''}
                    </p>
                  ))}
                  {!proposal.component && !proposal.coordinates.length ? (
                    <p>{tx('tx.oss.relativization.review.empty')}</p>
                  ) : null}
                </section>
                <div className='grid grid-cols-2 gap-x-3 gap-y-2'>
                  <h2 className='font-semibold'>{tx('tx.oss.relativization.review.before')}</h2>
                  <h2 className='font-semibold'>{tx('tx.oss.relativization.review.after')}</h2>
                  {textFields.map(field => (
                    <div key={field} className='contents'>
                      <div>
                        <strong>{tx(labels[field])}</strong>
                        <p className='whitespace-pre-wrap break-words'>
                          {proposal.before[field] || tx('tx.oss.relativization.review.empty')}
                        </p>
                      </div>
                      <div>
                        <TextArea
                          id={'review-' + item.id + '-' + field}
                          label={tx(labels[field])}
                          className='w-full'
                          rows={field === 'term_raw' ? 1 : 3}
                          value={fields[field]}
                          onChange={event =>
                            onChange({
                              ...row,
                              fields: { ...fields, [field]: event.target.value },
                              conflicts: row.conflicts.filter(value => value !== field),
                              clarified: false
                            })
                          }
                        />
                        {row.conflicts.includes(field) ? (
                          <div className='cc-column gap-1'>
                            <p>{tx('tx.oss.relativization.review.conflict')}</p>
                            <p className='whitespace-pre-wrap break-words'>{item[field]}</p>
                            <div className='flex flex-wrap gap-1'>
                              <Button
                                text={tx('tx.oss.relativization.review.keep')}
                                onClick={() =>
                                  onChange({ ...row, conflicts: row.conflicts.filter(value => value !== field) })
                                }
                              />
                              <Button
                                text={tx('tx.oss.relativization.review.accept')}
                                onClick={() =>
                                  onChange({
                                    ...row,
                                    fields: { ...fields, [field]: item[field] },
                                    conflicts: row.conflicts.filter(value => value !== field)
                                  })
                                }
                              />
                            </div>
                          </div>
                        ) : null}
                        {proposal.missing.includes(field) ? (
                          <p className='text-destructive'>{tx('tx.oss.relativization.review.missing')}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                {proposal.ambiguous.length ? (
                  <p>{tx('tx.oss.relativization.review.links', { aliases: proposal.ambiguous.join(', ') })}</p>
                ) : null}
                {proposal.missing.length || proposal.ambiguous.length ? (
                  <Checkbox
                    label={tx('tx.oss.relativization.review.clarified')}
                    role='checkbox'
                    aria-checked={row.clarified}
                    value={row.clarified}
                    onChange={value => onChange({ ...row, clarified: value })}
                  />
                ) : null}
              </div>
            </details>
          );
        })}
      </fieldset>
    </div>
  );
}
