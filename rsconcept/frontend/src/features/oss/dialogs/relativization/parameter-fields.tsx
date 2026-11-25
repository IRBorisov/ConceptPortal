import { useEffect, useRef } from 'react';

import { useTx } from '@/i18n';
import { type Constituenta, CstType } from '@rsconcept/domain/library';

import { SelectConstituenta } from '@/features/rsform/components/select-constituenta';

import { Label, TextArea, TextInput } from '@/components/input';
import { limits } from '@/utils/constants';

const kernelTypes = new Set<CstType>([CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED]);

export function getRelativizationExclusions(items: readonly Constituenta[], target: Constituenta | null) {
  return items.filter(item => item.id !== target?.id && kernelTypes.has(item.cst_type));
}

interface ParameterFieldsProps {
  targets: Constituenta[];
  target: Constituenta | null;
  focusTarget?: boolean;
  onTargetChange: (target: Constituenta | null) => void;
  contextName: string;
  maxContextLength?: number;
  onContextNameChange: (name: string) => void;
  exclusions: Constituenta[];
  excludedIDs: number[];
  onExcludedChange: (id: number, checked: boolean) => void;
}

export function RelativizationParameterFields({
  targets,
  target,
  focusTarget,
  onTargetChange,
  contextName,
  maxContextLength = limits.len_title,
  onContextNameChange,
  exclusions,
  excludedIDs,
  onExcludedChange
}: ParameterFieldsProps) {
  const tx = useTx();
  const fields = useRef<HTMLDivElement>(null);
  useEffect(
    function restoreTargetFocus() {
      if (focusTarget) fields.current?.querySelector<HTMLButtonElement>('#relativization_target')?.focus();
    },
    [focusTarget]
  );
  const count = exclusions.filter(item => excludedIDs.includes(item.id)).length;
  return (
    <>
      <div ref={fields} className='grid items-start gap-3 @md/modal:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
        <div className='grid min-w-0 gap-2'>
          <Label text={tx('tx.oss.relativization.target')} htmlFor='relativization_target' />
          <SelectConstituenta
            id='relativization_target'
            className='h-9 text-left [&_svg]:size-4'
            items={targets}
            placeholder={tx('tx.oss.relativization.target.select')}
            value={target}
            onChange={onTargetChange}
          />
        </div>
        <TextInput
          id='relativization_context'
          label={tx('tx.oss.relativization.review.context.name')}
          aria-required
          value={contextName}
          maxLength={maxContextLength}
          onChange={event => onContextNameChange(event.target.value)}
        />
      </div>
      {exclusions.length > 0 ? (
        <details className='rounded-md border border-border'>
          <summary className='flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm focus-visible:focus-frame'>
            {tx('tx.oss.relativization.excluded')}
            {count > 0 ? <span className='ml-auto tabular-nums text-muted-foreground'>{count}</span> : null}
          </summary>
          <fieldset
            className='grid max-h-40 gap-x-4 gap-y-1 overflow-y-auto border-t border-border px-3 py-2 @md/modal:grid-cols-2'
            aria-label={tx('tx.oss.relativization.excluded')}
          >
            {exclusions.map(item => (
              <label key={item.id} className='flex cursor-pointer items-start gap-2 py-1 text-sm'>
                <input
                  type='checkbox'
                  className='mt-0.5 size-4 shrink-0 accent-primary'
                  checked={excludedIDs.includes(item.id)}
                  onChange={event => onExcludedChange(item.id, event.target.checked)}
                />
                <span className='min-w-0 break-words'>
                  {[item.alias, item.term_resolved].filter(Boolean).join(' — ')}
                </span>
              </label>
            ))}
          </fieldset>
        </details>
      ) : null}
    </>
  );
}

interface ResultFieldsProps extends React.PropsWithChildren {
  title: string;
  onTitleChange: (name: string) => void;
  alias: string;
  onAliasChange: (alias: string) => void;
  aliasError?: string;
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function RelativizationResultFields({
  title,
  onTitleChange,
  alias,
  onAliasChange,
  aliasError,
  description,
  onDescriptionChange,
  children
}: ResultFieldsProps) {
  const tx = useTx();
  return (
    <fieldset data-tour='relativization-result' className='min-w-0 border-t border-border pt-3'>
      <legend className='pr-2 text-sm font-semibold'>{tx('tx.oss.relativization.result')}</legend>
      <div className='grid gap-3'>
        <div className='grid items-start gap-3 @md/modal:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
          <TextInput
            id='relativization_title'
            aria-label={tx('tx.lib.title')}
            aria-required
            placeholder={tx('tx.lib.title')}
            value={title}
            maxLength={limits.len_title}
            onChange={event => onTitleChange(event.target.value)}
          />
          <TextInput
            id='relativization_alias'
            aria-label={tx('tx.lib.alias')}
            aria-required
            placeholder={tx('tx.lib.alias')}
            value={alias}
            maxLength={limits.len_alias}
            error={aliasError}
            onChange={event => onAliasChange(event.target.value)}
          />
        </div>
        <TextArea
          id='relativization_description'
          aria-label={tx('tx.lib.description')}
          placeholder={tx('tx.lib.description')}
          value={description}
          maxLength={limits.len_description}
          rows={2}
          onChange={event => onDescriptionChange(event.target.value)}
        />
        {children}
      </div>
    </fieldset>
  );
}
