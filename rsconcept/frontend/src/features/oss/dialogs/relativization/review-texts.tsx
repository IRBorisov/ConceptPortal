import { useEffect, useRef } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { type AppLocale, useTx } from '@/i18n';

import { Button } from '@/components/control';
import { Checkbox, Label, TextArea } from '@/components/input';
import { cn } from '@/components/utils';

import { isReviewed, type ReviewRow, type TextField, textFields } from './review';

const labels: Record<TextField, string> = {
  term_raw: 'tx.lang.term',
  definition_raw: 'tx.lib.defineText',
  convention: 'tx.lib.convention'
};

interface Props {
  rows: ReviewRow[];
  onChange: (row: ReviewRow) => void;
  disabled: boolean;
  locale: AppLocale;
}

export function ReviewRelativizationTexts({ rows, onChange, disabled, locale }: Props) {
  const tx = useTx();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(function focusReviewHeading() {
    heading.current?.focus();
  }, []);

  const kernel = rows.filter(row => row.proposal.inKernel);
  const completed = kernel.filter(isReviewed).length;
  return (
    <div className='grid gap-3 py-3'>
      <div className='border-b border-border pb-3'>
        <h2 ref={heading} tabIndex={-1} className='text-left text-base font-semibold focus:outline-hidden'>
          {tx('tx.oss.relativization.review.heading')}
        </h2>
        <p className='text-sm text-foreground/75' aria-live='polite'>
          {tx('tx.oss.relativization.review.progress', { completed, total: kernel.length })}
        </p>
      </div>
      <fieldset disabled={disabled} className='grid min-w-0 gap-2'>
        {rows.map(row => {
          const { proposal, item, fields } = row;
          const reviewed = isReviewed(row);
          const status = proposal.formalInvalid
            ? tx('tx.oss.relativization.review.invalid.short')
            : proposal.inKernel || row.conflicts.length
              ? tx(reviewed ? 'tx.oss.relativization.review.reviewed' : 'tx.oss.relativization.review.required')
              : null;
          return (
            <details
              key={item.id}
              className='group/proposal rounded-lg border border-border'
              onToggle={event => {
                if (event.currentTarget.open && !row.visited) onChange({ ...row, visited: true });
              }}
            >
              <summary className='flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-muted/35 px-3 py-2.5 text-sm before:hidden focus-visible:focus-frame'>
                <ChevronDownIcon size={16} className='shrink-0 text-muted-foreground group-open/proposal:rotate-180' />
                <span className='shrink-0 font-mono font-semibold'>
                  {proposal.sourceAlias ? proposal.sourceAlias + ' → ' : ''}
                  {item.alias}
                </span>
                <span className='min-w-0 grow wrap-anywhere' lang={fields.term_raw ? locale : undefined}>
                  {fields.term_raw || tx('tx.oss.relativization.review.empty')}
                </span>
                {status ? (
                  <span
                    className={cn(
                      'rounded-full border border-border px-2 py-0.5 text-xs',
                      proposal.formalInvalid
                        ? 'border-destructive/40 text-destructive'
                        : reviewed
                          ? 'text-foreground/75'
                          : 'border-primary/35 bg-primary/8 font-medium text-foreground'
                    )}
                  >
                    {status}
                  </span>
                ) : null}
              </summary>
              <div className='grid gap-3 border-t border-border p-3'>
                <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm'>
                  <span className='text-foreground/75'>{tx('tx.oss.relativization.review.types')}</span>
                  <code className='min-w-0 break-all'>
                    {proposal.beforeType || '∅'} → {proposal.afterType || '∅'}
                  </code>
                </div>
                {proposal.formalInvalid ? (
                  <p className='text-sm text-destructive' role='alert'>
                    {tx('tx.oss.relativization.review.invalid')}
                  </p>
                ) : null}
                {proposal.component || proposal.coordinates.length > 0 ? (
                  <details className='group/origins text-sm'>
                    <summary className='flex w-fit items-center gap-1 rounded-sm text-foreground/75 before:hidden focus-visible:focus-frame'>
                      <ChevronDownIcon size={14} className='shrink-0 group-open/origins:rotate-180' />
                      {tx('tx.oss.relativization.review.origins')}
                    </summary>
                    <div className='grid gap-1 border-l border-border pl-3 pt-1'>
                      {proposal.component ? (
                        <p className='break-words'>
                          {proposal.component.source} · {proposal.component.path.join('.')} · {proposal.component.term}{' '}
                          ·{' '}
                          {tx(
                            proposal.component.scope === 'context'
                              ? 'tx.oss.relativization.review.context'
                              : 'tx.oss.relativization.review.value'
                          )}
                        </p>
                      ) : null}
                      {proposal.coordinates.map(coordinate => (
                        <p key={coordinate.scope} className='break-words'>
                          {coordinate.path.join('.')} ·{' '}
                          {tx(
                            coordinate.scope === 'context'
                              ? 'tx.oss.relativization.review.context'
                              : 'tx.oss.relativization.review.value'
                          )}
                          {coordinate.label ? ' · ' + coordinate.label : ''}
                        </p>
                      ))}
                    </div>
                  </details>
                ) : null}
                <div className='grid gap-3'>
                  <div className='hidden gap-3 text-sm font-medium text-foreground/75 @lg/modal:grid @lg/modal:grid-cols-2'>
                    <span>{tx('tx.oss.relativization.review.before')}</span>
                    <span>{tx('tx.oss.relativization.review.after')}</span>
                  </div>
                  {textFields.map(field => {
                    const id = 'review-' + item.id + '-' + field;
                    const needsText = proposal.missing.includes(field);
                    const saved = row.confirmed[field];
                    const generated = item[field];
                    const chooseVersion = (value: string) =>
                      onChange({
                        ...row,
                        fields: { ...fields, [field]: value },
                        conflicts: row.conflicts.filter(conflict => conflict !== field),
                        clarified: value === fields[field] && row.clarified
                      });
                    return (
                      <div key={field} className='grid min-w-0 gap-1.5'>
                        <Label text={tx(labels[field])} htmlFor={id} />
                        <div className='grid min-w-0 items-stretch gap-2 @lg/modal:grid-cols-2 @lg/modal:gap-3'>
                          <div className='min-w-0 rounded-md bg-muted/55 px-3 py-2 text-sm'>
                            <p className='mb-1 text-xs text-foreground/75 @lg/modal:hidden'>
                              {tx('tx.oss.relativization.review.before')}
                            </p>
                            <p
                              className='whitespace-pre-wrap break-words'
                              lang={proposal.before[field] ? locale : undefined}
                            >
                              {proposal.before[field] || '—'}
                            </p>
                          </div>
                          <div className='grid min-w-0 items-start gap-1'>
                            <p className='text-xs text-foreground/75 @lg/modal:hidden'>
                              {tx('tx.oss.relativization.review.after')}
                            </p>
                            <TextArea
                              id={id}
                              lang={locale}
                              aria-describedby={needsText ? id + '-hint' : undefined}
                              areaClassName={cn('resize-y whitespace-pre-wrap', field !== 'term_raw' && 'min-h-16')}
                              rows={field === 'term_raw' ? 1 : 3}
                              fitContent
                              value={fields[field]}
                              onChange={event =>
                                onChange({
                                  ...row,
                                  fields: { ...fields, [field]: event.target.value },
                                  clarified: false
                                })
                              }
                            />
                            {row.conflicts.includes(field) ? (
                              <div className='grid gap-1 rounded-md border border-border p-2 text-sm'>
                                <p className='font-semibold'>{tx('tx.oss.relativization.review.conflict')}</p>
                                <div className='justify-self-start'>
                                  <Button
                                    text={tx('tx.oss.relativization.review.keep')}
                                    onClick={() => chooseVersion(fields[field])}
                                  />
                                </div>
                                {saved !== undefined && saved !== fields[field] ? (
                                  <div className='grid justify-items-start gap-1 border-t border-border pt-2'>
                                    <p className='font-medium'>{tx('tx.oss.relativization.review.saved')}</p>
                                    <p className='whitespace-pre-wrap break-words' lang={locale}>
                                      {saved || '—'}
                                    </p>
                                    <Button
                                      text={tx('tx.oss.relativization.review.useSaved')}
                                      onClick={() => chooseVersion(saved)}
                                    />
                                  </div>
                                ) : null}
                                {generated !== fields[field] && generated !== saved ? (
                                  <div className='grid justify-items-start gap-1 border-t border-border pt-2'>
                                    <p className='font-medium'>{tx('tx.oss.relativization.review.proposed')}</p>
                                    <p className='whitespace-pre-wrap break-words' lang={locale}>
                                      {generated || '—'}
                                    </p>
                                    <Button
                                      text={tx('tx.oss.relativization.review.accept')}
                                      onClick={() => chooseVersion(generated)}
                                    />
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                            {needsText ? (
                              <p id={id + '-hint'} className='text-sm text-destructive'>
                                {tx('tx.oss.relativization.review.missing')}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {proposal.ambiguous.length ? (
                  <p className='text-sm'>
                    {tx('tx.oss.relativization.review.links', { aliases: proposal.ambiguous.join(', ') })}
                  </p>
                ) : null}
                {proposal.missing.length || proposal.ambiguous.length ? (
                  <Checkbox
                    role='checkbox'
                    aria-checked={row.clarified}
                    className='min-w-0 justify-self-start [&>div]:shrink-0 [&>span]:whitespace-normal'
                    label={tx('tx.oss.relativization.review.clarified')}
                    value={row.clarified}
                    onChange={clarified => onChange({ ...row, clarified })}
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
