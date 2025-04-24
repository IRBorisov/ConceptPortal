'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IOssLayout, type IUpdateBlockDTO, schemaUpdateBlock } from '../backend/types';
import { useUpdateBlock } from '../backend/use-update-block';
import { SelectParent } from '../components/select-parent';
import { type IBlock, type IOperationSchema } from '../models/oss';

export interface DlgEditBlockProps {
  oss: IOperationSchema;
  target: IBlock;
  layout: IOssLayout;
}

export function DlgEditBlock() {
  const { oss, target, layout } = useDialogsStore(state => state.props as DlgEditBlockProps);
  const { updateBlock } = useUpdateBlock();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isValid }
  } = useForm<IUpdateBlockDTO>({
    resolver: zodResolver(schemaUpdateBlock),
    defaultValues: {
      target: target.id,
      item_data: {
        title: target.title,
        description: target.description,
        parent: target.parent
      },
      layout: layout
    },
    mode: 'onChange'
  });

  function onSubmit(data: IUpdateBlockDTO) {
    return updateBlock({ itemID: oss.id, data });
  }

  return (
    <ModalForm
      header='Редактирование блока'
      submitText='Сохранить'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-160 px-6 pb-2 h-fit cc-column'
    >
      <TextInput
        id='operation_title' //
        label='Название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <Controller
        name='item_data.parent'
        control={control}
        render={({ field }) => (
          <SelectParent
            items={oss.blocks.filter(block => block.id !== target.id)}
            value={field.value ? oss.blockByID.get(field.value) ?? null : null}
            placeholder='Блок содержания не выбран'
            onChange={value => field.onChange(value ? value.id : null)}
          />
        )}
      />

      <TextArea
        id='operation_comment' //
        label='Описание'
        noResize
        rows={5}
        {...register('item_data.description')}
      />
    </ModalForm>
  );
}
