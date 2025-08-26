'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateSchemaDTO, type IOssLayout, schemaCreateSchema } from '../backend/types';
import { useCreateSchema } from '../backend/use-create-schema';
import { useOssSuspense } from '../backend/use-oss';
import { SelectParent } from '../components/select-parent';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '../models/oss-layout-api';

export interface DlgCreateSchemaProps {
  ossID: number;
  layout: IOssLayout;
  defaultX: number;
  defaultY: number;
  initialParent: number | null;
  onCreate?: (newID: number) => void;
}

export function DlgCreateSchema() {
  const { createSchema } = useCreateSchema();

  const {
    ossID, //
    layout,
    initialParent,
    onCreate,
    defaultX,
    defaultY
  } = useDialogsStore(state => state.props as DlgCreateSchemaProps);

  const { schema } = useOssSuspense({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ICreateSchemaDTO>({
    resolver: zodResolver(schemaCreateSchema),
    defaultValues: {
      item_data: {
        alias: '',
        title: '',
        description: '',
        parent: initialParent
      },
      position: {
        x: defaultX,
        y: defaultY,
        width: OPERATION_NODE_WIDTH,
        height: OPERATION_NODE_HEIGHT
      },
      layout: manager.layout
    },
    mode: 'onChange'
  });
  const alias = useWatch({ control: control, name: 'item_data.alias' });
  const isValid = !!alias && !manager.oss.operations.some(operation => operation.alias === alias);

  function onSubmit(data: ICreateSchemaDTO) {
    data.position = manager.newOperationPosition(data);
    data.layout = manager.layout;
    void createSchema({ itemID: manager.oss.id, data: data }).then(response => onCreate?.(response.new_operation));
  }

  return (
    <ModalForm
      header='Создание операции: Новая схема'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-180 px-6 pb-3 cc-column'
      helpTopic={HelpTopic.CC_OSS}
    >
      <TextInput
        id='operation_title' //
        label='Название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <div className='flex gap-6'>
        <div className='flex flex-col justify-between gap-3'>
          <TextInput
            id='operation_alias' //
            label='Сокращение'
            className='w-80'
            {...register('item_data.alias')}
            error={errors.item_data?.alias}
          />
          <Controller
            name='item_data.parent'
            control={control}
            render={({ field }) => (
              <SelectParent
                items={manager.oss.blocks}
                value={field.value ? manager.oss.blockByID.get(field.value) ?? null : null}
                placeholder='Родительский блок'
                onChange={value => field.onChange(value ? value.id : null)}
              />
            )}
          />
        </div>
        <TextArea
          id='operation_comment' //
          label='Описание'
          noResize
          rows={4}
          {...register('item_data.description')}
        />
      </div>
    </ModalForm>
  );
}
