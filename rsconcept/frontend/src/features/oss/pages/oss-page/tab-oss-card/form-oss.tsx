'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { LibraryItemType, schemaUpdateLibraryItem, type UpdateLibraryItemDTO } from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { ToolbarItemAccess } from '@/features/library/components/toolbar-item-access';

import { SubmitButton } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { type OperationSchema } from '../../../models/oss';
import { useOssEdit } from '../oss-edit-context';

function ossDefaults(schema: OperationSchema): UpdateLibraryItemDTO {
  return {
    id: schema.id,
    item_type: LibraryItemType.RSFORM,
    title: schema.title,
    alias: schema.alias,
    description: schema.description,
    visible: schema.visible,
    read_only: schema.read_only
  };
}

export function FormOSS() {
  const { updateItem: updateOss } = useUpdateItem();
  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const isProcessing = useMutatingOss();
  const { schema, isMutable } = useOssEdit();

  const form = useForm({
    defaultValues: ossDefaults(schema),
    validators: {
      onChange: schemaUpdateLibraryItem
    },
    onSubmit: async ({ value, formApi }) => {
      await updateOss(value);
      formApi.reset(value);
    }
  });

  const onResetEvent = useEffectEvent((next: UpdateLibraryItemDTO) => {
    form.reset(next);
  });

  const visible = useStore(form.store, state => state.values.visible);
  const readOnly = useStore(form.store, state => state.values.read_only);
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);

  useEffect(function resetFormOnSchemaChange() {
    onResetEvent(ossDefaults(schema));
  }, [schema]);

  useEffect(function syncGlobalModified() {
    onModifiedEvent(!isDefaultValue);
  }, [isDefaultValue]);

  return (
    <form
      id={globalIDs.library_item_editor}
      className='mt-1 min-w-88 sm:w-120 flex flex-col pt-1'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name='title'>
        {field => (
          <TextInput
            id='schema_title'
            label='Название'
            className='mb-3'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
            disabled={!isMutable}
          />
        )}
      </form.Field>
      <div className='relative flex justify-between gap-3 mb-3'>
        <form.Field name='alias'>
          {field => (
            <TextInput
              id='schema_alias'
              label='Сокращение'
              className='w-64'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
              disabled={!isMutable}
            />
          )}
        </form.Field>
        <ToolbarItemAccess
          className='absolute top-18 right-2'
          visible={visible}
          toggleVisible={() => form.setFieldValue('visible', !visible)}
          readOnly={readOnly}
          toggleReadOnly={() => form.setFieldValue('read_only', !readOnly)}
          schema={schema}
          isProduced={false}
        />
      </div>

      <form.Field name='description'>
        {field => (
          <TextArea
            id='schema_comment'
            label='Описание'
            rows={3}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
            disabled={!isMutable || isProcessing}
          />
        )}
      </form.Field>
      {isMutable || isModified ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={isProcessing}
          icon={<IconSave size='1.25rem' />}
          disabled={!isModified}
        />
      ) : null}
    </form>
  );
}
