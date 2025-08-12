'use client';

import { Controller, useForm } from 'react-hook-form';

import { MiniButton } from '@/components/control';
import { Checkbox } from '@/components/input';
import { ModalForm } from '@/components/modal';

import { CstType } from '../backend/types';
import { IconCstType } from '../components/icon-cst-type';
import { labelCstType } from '../labels';
import { cstTypeToFilterKey, type GraphFilterParams, useTermGraphStore } from '../stores/term-graph';

export function DlgGraphParams() {
  const params = useTermGraphStore(state => state.filter);
  const setParams = useTermGraphStore(state => state.setFilter);

  const { handleSubmit, control } = useForm<GraphFilterParams>({
    defaultValues: { ...params }
  });

  function onSubmit(data: GraphFilterParams) {
    setParams(data);
  }

  return (
    <ModalForm
      header='Настройки графа термов'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      submitText='Применить'
      className='flex gap-6 justify-between px-6 pb-3 w-120'
    >
      <div className='flex flex-col gap-1'>
        <h1 className='mb-2'>Преобразования</h1>
        <Controller
          control={control}
          name='noText'
          render={({ field }) => <Checkbox {...field} label='Скрыть текст' title='Не отображать термины' />}
        />
        <Controller
          control={control}
          name='noHermits'
          render={({ field }) => <Checkbox {...field} label='Скрыть несвязанные' title='Неиспользуемые конституенты' />}
        />
        <Controller
          control={control}
          name='noTemplates'
          render={({ field }) => (
            <Checkbox
              {...field}
              label='Скрыть шаблоны'
              titleHtml='Терм-функции и предикат-функции <br/>с параметризованными аргументами'
            />
          )}
        />
        <Controller
          control={control}
          name='noTransitive'
          render={({ field }) => (
            <Checkbox
              {...field}
              label='Транзитивная редукция'
              titleHtml='Удалить связи, образующие <br/>транзитивные пути в графе'
            />
          )}
        />
        <Controller
          control={control}
          name='foldDerived'
          render={({ field }) => (
            <Checkbox {...field} label='Свернуть порожденные' title='Не отображать порожденные понятия' />
          )}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <h1 className='mb-1'>Типы конституент</h1>
        <div>
          {Object.values(CstType).map(cstType => {
            const fieldName = cstTypeToFilterKey[cstType];
            return (
              <Controller
                key={fieldName}
                control={control}
                name={fieldName}
                render={({ field }) => (
                  <MiniButton
                    onClick={() => field.onChange(!field.value)}
                    title={labelCstType(cstType)}
                    icon={
                      <IconCstType
                        size='2rem'
                        value={cstType}
                        className={field.value ? 'text-constructive' : 'text-destructive'}
                      />
                    }
                  />
                )}
              />
            );
          })}
        </div>
      </div>
    </ModalForm>
  );
}
