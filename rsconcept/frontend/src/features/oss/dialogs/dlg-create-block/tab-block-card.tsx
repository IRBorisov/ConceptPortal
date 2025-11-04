'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { TextArea, TextInput } from '@/components/input';

import { type ICreateBlockDTO } from '../../backend/types';
import { SelectParent } from '../../components/select-parent';
import { type IOperationSchema, NodeType } from '../../models/oss';
import { constructNodeID } from '../../models/oss-api';

interface TabBlockCardProps {
  oss: IOperationSchema;
}

export function TabBlockCard({ oss }: TabBlockCardProps) {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ICreateBlockDTO>();
  const children_blocks = useWatch({ control, name: 'children_blocks' });
  const block_ids = children_blocks.map(id => constructNodeID(NodeType.BLOCK, id));
  const all_children = [...block_ids, ...oss.hierarchy.expandAllOutputs(block_ids)];

  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title' //
        label='Название'
        placeholder='Введите название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <Controller
        name='item_data.parent'
        control={control}
        render={({ field }) => (
          <SelectParent
            items={oss.blocks.filter(block => !all_children.includes(block.nodeID))}
            value={field.value ? oss.blockByID.get(field.value) ?? null : null}
            placeholder='Родительский блок'
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
    </div>
  );
}
