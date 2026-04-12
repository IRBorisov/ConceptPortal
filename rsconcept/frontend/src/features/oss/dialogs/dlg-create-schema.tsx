'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { HelpTopic } from '@/features/help';

import { TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { type OssLayout } from '@/domain/library';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '@/domain/library/oss-layout-api';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type CreateSchemaDTO, schemaCreateSchema } from '../backend/types';
import { useCreateSchema } from '../backend/use-create-schema';
import { useOss } from '../backend/use-oss';
import { SelectParent } from '../components/select-parent';

export interface DlgCreateSchemaProps {
  ossID: number;
  layout: OssLayout;
  defaultX: number;
  defaultY: number;
  initialParent: number | null;
  onCreate?: (newID: number) => void;
}

export function DlgCreateSchema() {
  const { createSchema } = useCreateSchema();

  const { ossID, layout, initialParent, onCreate, defaultX, defaultY } = useDialogsStore(
    state => state.props as DlgCreateSchemaProps
  );

  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

  const form = useForm({
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
    } satisfies CreateSchemaDTO,
    validators: {
      onChange: schemaCreateSchema
    },
    onSubmit: ({ value }) => {
      const data = { ...value };
      data.position = manager.newOperationPosition(data);
      data.layout = manager.layout;
      void createSchema({ itemID: manager.oss.id, data }).then(response => onCreate?.(response.new_operation));
    }
  });

  const values = useStore(form.store, state => state.values as CreateSchemaDTO);
  const alias = values.item_data.alias;
  const { canSubmit, hint } = useMemo(() => {
    if (!alias) {
      return { canSubmit: false, hint: hintMsg.aliasEmpty };
    }
    if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: hintMsg.schemaAliasTaken };
    }
    if (!schemaCreateSchema.safeParse(values).success) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    }
    return { canSubmit: true, hint: '' };
  }, [alias, values, manager.oss.operations]);

  return (
    <ModalForm
      header='Создание операции: Новая схема'
      submitText='Создать'
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-180 px-6 pb-3 cc-column'
      helpTopic={HelpTopic.CC_OSS}
    >
      <form.Field name='item_data.title'>
        {field => (
          <TextInput
            id='operation_title'
            label='Название'
            placeholder='Введите название'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      <div className='flex gap-6'>
        <div className='flex flex-col justify-between gap-3'>
          <form.Field name='item_data.alias'>
            {field => (
              <TextInput
                id='operation_alias'
                label='Сокращение'
                className='w-80'
                placeholder='Введите сокращение'
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
          <form.Field name='item_data.parent'>
            {field => (
              <SelectParent
                items={manager.oss.blocks}
                value={field.state.value ? (manager.oss.blockByID.get(field.state.value) ?? null) : null}
                placeholder='Родительский блок'
                onChange={value => field.handleChange(value ? value.id : null)}
              />
            )}
          </form.Field>
        </div>
        <form.Field name='item_data.description'>
          {field => (
            <TextArea
              id='operation_comment'
              label='Описание'
              noResize
              rows={4}
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </div>
    </ModalForm>
  );
}
