'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type ILibraryItem, LibraryItemType } from '@/features/library';
import { useLibrary } from '@/features/library/backend/use-library';
import { PickSchema } from '@/features/library/components/pick-schema';

import { MiniButton } from '@/components/control';
import { IconReset } from '@/components/icons';
import { Label } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IOssLayout, type IUpdateInputDTO, schemaUpdateInput } from '../backend/types';
import { useUpdateInput } from '../backend/use-update-input';
import { type IOperation, type IOperationSchema } from '../models/oss';
import { sortItemsForOSS } from '../models/oss-api';

export interface DlgChangeInputSchemaProps {
  oss: IOperationSchema;
  target: IOperation;
  layout: IOssLayout;
}

export function DlgChangeInputSchema() {
  const { oss, target, layout } = useDialogsStore(state => state.props as DlgChangeInputSchemaProps);
  const { updateInput: inputUpdate } = useUpdateInput();

  const { setValue, handleSubmit, control } = useForm<IUpdateInputDTO>({
    resolver: zodResolver(schemaUpdateInput),
    defaultValues: {
      target: target.id,
      layout: layout,
      input: target.result
    }
  });

  const { items } = useLibrary();
  const sortedItems = sortItemsForOSS(oss, items);

  function baseFilter(item: ILibraryItem) {
    return !oss.schemas.includes(item.id) || item.id === target.result;
  }

  function onSubmit(data: IUpdateInputDTO) {
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
            value={field.value ?? null}
            onChange={field.onChange}
            rows={14}
            baseFilter={baseFilter}
          />
        )}
      />
    </ModalForm>
  );
}
