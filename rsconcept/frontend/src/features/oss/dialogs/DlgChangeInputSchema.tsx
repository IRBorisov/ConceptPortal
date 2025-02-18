'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { ILibraryItem, LibraryItemType, PickSchema, useLibrary } from '@/features/library';

import { MiniButton } from '@/components/Control';
import { IconReset } from '@/components/Icons';
import { Label } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';

import { IInputUpdateDTO, IOperation, IOperationPosition, schemaInputUpdate } from '../backend/types';
import { useInputUpdate } from '../backend/useInputUpdate';
import { IOperationSchema } from '../models/oss';
import { sortItemsForOSS } from '../models/ossAPI';

export interface DlgChangeInputSchemaProps {
  oss: IOperationSchema;
  target: IOperation;
  positions: IOperationPosition[];
}

function DlgChangeInputSchema() {
  const { oss, target, positions } = useDialogsStore(state => state.props as DlgChangeInputSchemaProps);
  const { inputUpdate } = useInputUpdate();

  const { setValue, handleSubmit, control } = useForm<IInputUpdateDTO>({
    resolver: zodResolver(schemaInputUpdate),
    defaultValues: {
      target: target.id,
      positions: positions,
      input: target.result
    }
  });

  const { items } = useLibrary();
  const sortedItems = sortItemsForOSS(oss, items);

  function baseFilter(item: ILibraryItem) {
    return !oss.schemas.includes(item.id) || item.id === target.result;
  }

  function onSubmit(data: IInputUpdateDTO) {
    return inputUpdate({ itemID: oss.id, data: data });
  }

  return (
    <ModalForm
      overflowVisible
      header='Выбор концептуальной схемы'
      submitText='Подтвердить выбор'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className={clsx('w-[35rem]', 'pb-3 px-6 cc-column')}
    >
      <div className='flex justify-between gap-3 items-center'>
        <div className='flex gap-3'>
          <Label text='Загружаемая концептуальная схема' />
          <MiniButton
            title='Сбросить выбор схемы'
            noHover
            noPadding
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={() => setValue('input', null)}
          />
        </div>
      </div>
      <Controller
        name='input'
        control={control}
        render={({ field }) => (
          <PickSchema
            items={sortedItems}
            itemType={LibraryItemType.RSFORM}
            value={field.value}
            onChange={field.onChange}
            rows={14}
            baseFilter={baseFilter}
          />
        )}
      />
    </ModalForm>
  );
}

export default DlgChangeInputSchema;
