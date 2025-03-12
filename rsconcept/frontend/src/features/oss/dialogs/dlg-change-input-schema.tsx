'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type ILibraryItem, LibraryItemType } from '@/features/library';
import { useLibrary } from '@/features/library/backend/use-library';
import { PickSchema } from '@/features/library/components';

import { MiniButton } from '@/components/control1';
import { IconReset } from '@/components/icons1';
import { Label } from '@/components/input1';
import { ModalForm } from '@/components/modal1';
import { useDialogsStore } from '@/stores/dialogs';

import { type IInputUpdateDTO, type IOperationPosition, schemaInputUpdate } from '../backend/types';
import { useInputUpdate } from '../backend/use-input-update';
import { type IOperation, type IOperationSchema } from '../models/oss';
import { sortItemsForOSS } from '../models/oss-api';

export interface DlgChangeInputSchemaProps {
  oss: IOperationSchema;
  target: IOperation;
  positions: IOperationPosition[];
}

export function DlgChangeInputSchema() {
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
      className='w-140 pb-3 px-6 cc-column'
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
