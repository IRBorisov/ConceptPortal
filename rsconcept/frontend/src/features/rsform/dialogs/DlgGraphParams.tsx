'use client';

import { Controller, useForm } from 'react-hook-form';

import { Checkbox } from '@/components/Input';
import { ModalForm } from '@/components/Modal';

import { labelCstType } from '../labels';
import { CstType } from '../models/rsform';
import { GraphFilterParams, useTermGraphStore } from '../stores/termGraph';

function DlgGraphParams() {
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
      className='flex gap-6 justify-between px-6 pb-3 w-[30rem]'
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
        <h1 className='mb-2'>Типы конституент</h1>
        <Controller
          control={control}
          name='allowBase'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.BASE)} />}
        />
        <Controller
          control={control}
          name='allowStruct'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.STRUCTURED)} />}
        />
        <Controller
          control={control}
          name='allowTerm'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.TERM)} />}
        />
        <Controller
          control={control}
          name='allowAxiom'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.AXIOM)} />}
        />
        <Controller
          control={control}
          name='allowFunction'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.FUNCTION)} />}
        />
        <Controller
          control={control}
          name='allowPredicate'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.PREDICATE)} />}
        />
        <Controller
          control={control}
          name='allowConstant'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.CONSTANT)} />}
        />
        <Controller
          control={control}
          name='allowTheorem'
          render={({ field }) => <Checkbox {...field} label={labelCstType(CstType.THEOREM)} />}
        />
      </div>
    </ModalForm>
  );
}

export default DlgGraphParams;
