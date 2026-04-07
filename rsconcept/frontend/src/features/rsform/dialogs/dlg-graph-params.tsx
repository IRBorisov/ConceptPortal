'use client';

import { useForm } from '@tanstack/react-form';

import { MiniButton } from '@/components/control';
import { Checkbox } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { prepareTooltip } from '@/utils/format';
import { withPreventDefault } from '@/utils/utils';

import { IconCstType } from '../components/icon-cst-type';
import { labelCstType } from '../labels';
import { CstType } from '../models/rsform';
import { cstTypeToFilterKey, type GraphFilterParams, useTermGraphStore } from '../stores/term-graph';

export function DlgGraphParams() {
  const params = useTermGraphStore(state => state.filter);
  const setParams = useTermGraphStore(state => state.setFilter);

  const form = useForm({
    defaultValues: { ...params } as GraphFilterParams,
    onSubmit: ({ value }) => setParams(value)
  });

  return (
    <ModalForm
      header='Настройки графа термов'
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
      submitText='Применить'
      className='flex gap-6 justify-between px-6 pb-3 w-120'
    >
      <div className='flex flex-col gap-1'>
        <h1 className='mb-2'>Преобразования</h1>
        <form.Field name='noText'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label='Скрыть текст'
              titleHtml={prepareTooltip('Не отображать термины', 'T')}
            />
          )}
        </form.Field>
        <form.Field name='foldDerived'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label='Скрыть порожденные'
              titleHtml={prepareTooltip('Не отображать порожденные понятия', 'B')}
            />
          )}
        </form.Field>
        <form.Field name='noHermits'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label='Скрыть свободные'
              titleHtml={prepareTooltip('Конституенты без связей', 'H')}
            />
          )}
        </form.Field>
        <form.Field name='noTemplates'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label='Скрыть шаблоны'
              titleHtml='Терм-функции и предикат-функции <br/>с параметризованными аргументами'
            />
          )}
        </form.Field>
        <form.Field name='noTransitive'>
          {field => (
            <Checkbox
              value={field.state.value ?? false}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              label='Транзитивная редукция'
              titleHtml='Удалить связи, образующие <br/>транзитивные пути в графе'
            />
          )}
        </form.Field>
      </div>
      <div className='flex flex-col items-center gap-1'>
        <h1 className='mb-1'>Типы конституент</h1>
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
