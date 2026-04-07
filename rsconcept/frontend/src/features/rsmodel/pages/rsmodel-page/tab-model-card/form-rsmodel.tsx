'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useConceptNavigation } from '@/app';
import {
  LibraryItemType,
  schemaUpdateLibraryItem,
  type UpdateLibraryItemDTO
} from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { ToolbarItemAccess } from '@/features/library/components/toolbar-item-access';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { type RSModel } from '@/features/rsmodel/models/rsmodel';

import { SubmitButton } from '@/components/control';
import { IconRSForm, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { ValueIcon } from '@/components/view';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useRSModelEdit } from '../rsmodel-context';

function modelDefaults(model: RSModel): UpdateLibraryItemDTO {
  return {
    id: model.id,
    item_type: LibraryItemType.RSMODEL,
    title: model.title,
    alias: model.alias,
    description: model.description,
    visible: model.visible,
    read_only: model.read_only
  };
}

export function FormRSModel() {
  const router = useConceptNavigation();
  const { updateItem } = useUpdateItem();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const { model, isMutable } = useRSModelEdit();
  const { schema, isProcessing } = useRSFormEdit();

  const form = useForm({
    defaultValues: modelDefaults(model),
    validators: {
      onChange: schemaUpdateLibraryItem
    },
    onSubmit: async ({ value, formApi }) => {
      await updateItem(value);
      formApi.reset(value);
    }
  });

  const visible = useStore(form.store, state => state.values.visible);
  const readOnly = useStore(form.store, state => state.values.read_only);
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);

  const onResetEvent = useEffectEvent((next: UpdateLibraryItemDTO) => {
    form.reset(next);
  });

  useEffect(function resetFormOnModelChange() {
    onResetEvent(modelDefaults(model));
  }, [model]);

  useEffect(function syncGlobalModified() {
    onModifiedEvent(!isDefaultValue);
  }, [isDefaultValue]);

  function handleNavigateSchema() {
    router.gotoRSForm(model.schema);
  }

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
      <div className='flex justify-between gap-3 mb-3 items-center'>
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
          className='mt-6 mr-2'
          visible={visible}
          toggleVisible={() => form.setFieldValue('visible', !visible)}
          readOnly={readOnly}
          toggleReadOnly={() => form.setFieldValue('read_only', !readOnly)}
          schema={model}
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
      {isMutable || !isDefaultValue ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={isProcessing}
          icon={<IconSave size='1.25rem' />}
          disabled={isDefaultValue}
        />
      ) : null}

      <ValueIcon
        className='mt-3'
        icon={<IconRSForm size='1.25rem' className='icon-primary' />}
        value={schema.alias}
        title='Концептуальная схема'
        onClick={handleNavigateSchema}
        disabled={false}
      />
    </form>
  );
}
