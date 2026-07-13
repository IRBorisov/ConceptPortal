'use client';

import { useForm } from '@tanstack/react-form';

import { useTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library';

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
      header={tx('tx.general.view.settings')}
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
      submitText={tx('tx.general.save')}
      className='flex gap-6 justify-between px-6 pb-3 w-120'
    >
      <div className='flex flex-col gap-1'>
        <form.Field name='noText'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('tx.general.labels.hide')}
              title={prepareTooltip(tx('tx.general.labels.hide'), 'T')}
            />
          )}
        </form.Field>
        <form.Field name='overviewCore'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('tx.termGraph.overviewCore')}
              title={prepareTooltip(tx('tx.termGraph.overviewCore.hint'), 'O')}
            />
          )}
        </form.Field>
        <form.Field name='foldDerived'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('tx.cst.spawned.hide')}
              title={prepareTooltip(tx('tx.cst.spawned.hide'), 'B')}
            />
          )}
        </form.Field>
        <form.Field name='noHermits'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('tx.graph.node.isolated.hide')}
              title={prepareTooltip(tx('tx.graph.node.isolated.hide.hint'), 'H')}
            />
          )}
        </form.Field>
        <form.Field name='noTemplates'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('tx.cst.class.template.hide')}
              title={tx('tx.cst.class.template.hint')}
            />
          )}
        </form.Field>
        <form.Field name='noTransitive'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label={tx('tx.graph.transitiveReduction')}
              title={tx('tx.graph.transitiveReduction.hint')}
            />
          )}
        </form.Field>
      </div>
      <div className='flex flex-col items-center gap-1'>
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
