'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IUpdateBlockDTO, schemaUpdateBlock } from '../backend/types';
import { useUpdateBlock } from '../backend/use-update-block';
import { SelectParent } from '../components/select-parent';
import { type IBlock } from '../models/oss';
import { type LayoutManager } from '../models/oss-layout-api';

export interface DlgEditBlockProps {
  manager: LayoutManager;
  target: IBlock;
}

export function DlgEditBlock() {
  const { manager, target } = useDialogsStore(state => state.props as DlgEditBlockProps);
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
      layout: manager.layout
    },
    mode: 'onChange'
  });

  function onSubmit(data: IUpdateBlockDTO) {
    if (data.item_data.parent !== target.parent) {
      manager.onChangeParent(target.nodeID, data.item_data.parent === null ? null : `b${data.item_data.parent}`);
      data.layout = manager.layout;
    }
    return updateBlock({ itemID: manager.oss.id, data });
  }

  return (
    <ModalForm
      header='Редактирование блока'
      submitText='Сохранить'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-160 px-6 pb-2 h-fit cc-column'
      helpTopic={HelpTopic.CC_STRUCTURING}
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
        render={({ field }) => {
          const descendantNodeIDs = manager.oss.hierarchy.expandAllOutputs([target.nodeID]);
          descendantNodeIDs.push(target.nodeID);
          return (
            <SelectParent
              items={manager.oss.blocks.filter(block => !descendantNodeIDs.includes(block.nodeID))}
              value={field.value ? manager.oss.blockByID.get(field.value) ?? null : null}
              placeholder='Родительский блок'
              onChange={value => field.onChange(value ? value.id : null)}
            />
          );
        }}
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
