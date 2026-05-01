'use client';

import { useForm } from '@tanstack/react-form';

import { CstType } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';

import { MiniButton } from '@/components/control';
import { Checkbox } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { prepareTooltip } from '@/utils/format';
import { withPreventDefault } from '@/utils/utils';

import { IconCstType } from '../components/icon-cst-type';
import { labelCstType } from '../labels';
import { cstTypeToFilterKey, useTermGraphStore } from '../stores/term-graph';

export function DlgGraphParams() {
  const tx = useTx();
  const params = useTermGraphStore(state => state.filter);
  const setParams = useTermGraphStore(state => state.setFilter);

  const form = useForm({
    defaultValues: { ...params },
    onSubmit: ({ value }) => setParams(value)
  });

  return (
    <ModalForm
      header={tx('ui.termGraph.dialog.title', 'Term graph settings')}
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
      submitText={tx('ui.termGraph.dialog.apply', 'Apply')}
      className='flex gap-6 justify-between px-6 pb-3 w-120'
    >
      <div className='flex flex-col gap-1'>
        <h1 className='mb-2'>{tx('ui.termGraph.dialog.transforms', 'Transforms')}</h1>
        <form.Field name='noText'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('ui.termGraph.filter.hideText', 'Hide text')}
              title={prepareTooltip(tx('ui.termGraph.filter.hideTextHint', 'Do not show terms'), 'T')}
            />
          )}
        </form.Field>
        <form.Field name='foldDerived'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('ui.termGraph.filter.hideDerived', 'Hide derived')}
              title={prepareTooltip(tx('ui.termGraph.filter.hideDerivedHint', 'Do not show derived notions'), 'B')}
            />
          )}
        </form.Field>
        <form.Field name='noHermits'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('ui.termGraph.filter.hideFree', 'Hide isolated')}
              title={prepareTooltip(tx('ui.termGraph.filter.hideFreeHint', 'Constituents without links'), 'H')}
            />
          )}
        </form.Field>
        <form.Field name='noTemplates'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('ui.termGraph.filter.hideTemplates', 'Hide templates')}
              title={tx(
                'ui.termGraph.filter.hideTemplatesHint',
                'Term functions and predicate functions\nwith parameterized arguments'
              )}
            />
          )}
        </form.Field>
        <form.Field name='noTransitive'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('ui.termGraph.filter.transitiveReduction', 'Transitive reduction')}
              title={tx(
                'ui.termGraph.filter.transitiveReductionHint',
                'Remove edges that form\ntransitive paths in the graph'
              )}
            />
          )}
        </form.Field>
      </div>
      <div className='flex flex-col items-center gap-1'>
        <h1 className='mb-1'>{tx('ui.termGraph.dialog.cstTypes', 'Constituent types')}</h1>
        <div className='grid grid-cols-3'>
          {Object.values(CstType).map(cstType => {
            const fieldName = cstTypeToFilterKey[cstType];
            return (
              <form.Field key={fieldName} name={fieldName}>
                {field => (
                  <MiniButton
                    onClick={() => field.handleChange(!field.state.value)}
                    title={labelCstType(cstType)}
                    icon={
                      <IconCstType
                        size='2rem'
                        value={cstType}
                        className={field.state.value ? 'text-constructive' : 'text-destructive'}
                      />
                    }
                  />
                )}
              </form.Field>
            );
          })}
        </div>
      </div>
    </ModalForm>
  );
}
