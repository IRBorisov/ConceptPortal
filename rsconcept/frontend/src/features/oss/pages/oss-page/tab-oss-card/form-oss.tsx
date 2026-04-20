'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { LibraryItemType } from '@/domain/library';
import { type OperationSchema } from '@/domain/library';

import { schemaUpdateLibraryItem, type UpdateLibraryItemDTO } from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { ToolbarItemAccess } from '@/features/library/components/toolbar-item-access';

import { SubmitButton } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';
import { placeholderMsg } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useOssEdit } from '../oss-edit-context';

interface FormOSSProps {
  className?: string;
}

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

export function FormOSS({ className }: FormOSSProps) {
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

  useEffect(
    function resetFormOnSchemaChange() {
      onResetEvent(ossDefaults(schema));
    },
    [schema]
  );

  useEffect(
    function syncGlobalModified() {
      onModifiedEvent(!isDefaultValue);
    },
    [isDefaultValue]
  );

  return (
    <form
      id={globalIDs.library_item_editor}
      className={cn('flex flex-col pt-1', className)}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <h2 className='mb-2 select-none'>Операционная система</h2>
      <form.Field name='title'>
        {field => (
          <TextInput
            id='schema_title'
            aria-label='Название операционной системы'
            placeholder='Название операционной системы'
            className='mb-3'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
            disabled={!isMutable}
          />
        )}
      </form.Field>
      <div className='relative flex justify-between gap-3 mb-3 items-center'>
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
          visible={visible}
          className='mt-6'
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
            placeholder={placeholderMsg.itemDescription}
            rows={5}
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
          titleHtml={prepareTooltip('Сохранить изменения', isMac() ? 'Cmd + S' : 'Ctrl + S')}
          className='self-center mt-4'
          loading={isProcessing}
          icon={<IconSave size='1.25rem' />}
          disabled={!isModified}
        />
      ) : null}
    </form>
  );
}
