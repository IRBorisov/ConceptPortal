'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useConceptNavigation } from '@/app';
import {
  type CurrentVersion,
  LibraryItemType,
  schemaUpdateLibraryItem,
  type UpdateLibraryItemDTO
} from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { SelectVersion } from '@/features/library/components/select-version';
import { ToolbarItemAccess } from '@/features/library/components/toolbar-item-access';
import { type RSForm } from '@/features/rsform/models/rsform';

import { SubmitButton } from '@/components/control';
import { IconSave } from '@/components/icons';
import { Label, TextArea, TextInput } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useRSFormEdit } from '../rsedit-context';

import { ToolbarVersioning } from './toolbar-versioning';

function itemDefaults(schema: RSForm): UpdateLibraryItemDTO {
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

export function FormRSForm() {
  const router = useConceptNavigation();
  const { updateItem: updateSchema } = useUpdateItem();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const { schema, isContentEditable, isProcessing } = useRSFormEdit();

  const form = useForm({
    defaultValues: itemDefaults(schema),
    validators: {
      onChange: schemaUpdateLibraryItem
    },
    onSubmit: async ({ value, formApi }) => {
      await updateSchema(value);
      formApi.reset(value);
    }
  });

  const visible = useStore(form.store, state => state.values.visible);
  const readOnly = useStore(form.store, state => state.values.read_only);
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);

  const onResetEvent = useEffectEvent((next: UpdateLibraryItemDTO) => {
    form.reset(next);
  });

  useEffect(
    function resetFormOnSchemaChange() {
      onResetEvent(itemDefaults(schema));
    },
    [schema]
  );

  useEffect(
    function syncGlobalModified() {
      onModifiedEvent(!isDefaultValue);
    },
    [isDefaultValue]
  );

  function handleSelectVersion(version: CurrentVersion) {
    router.gotoRSForm(schema.id, version === 'latest' ? undefined : version);
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
            disabled={!isContentEditable}
          />
        )}
      </form.Field>
      <div className='flex justify-between gap-3 mb-3'>
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
              disabled={!isContentEditable}
            />
          )}
        </form.Field>
        <div className='relative flex flex-col gap-2'>
          <ToolbarVersioning className='absolute -top-1 right-2' blockReload={schema.oss.length > 0} />

          <Label text='Версия' className='select-none w-fit' />
          <SelectVersion
            id='schema_version'
            className='select-none'
            value={schema.version} //
            items={schema.versions}
            onChange={handleSelectVersion}
          />

          <ToolbarItemAccess
            className='absolute top-18 right-2'
            visible={visible}
            toggleVisible={() => form.setFieldValue('visible', !visible)}
            readOnly={readOnly}
            toggleReadOnly={() => form.setFieldValue('read_only', !readOnly)}
            schema={schema}
            isProduced={schema.is_produced}
          />
        </div>
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
            disabled={!isContentEditable || isProcessing}
          />
        )}
      </form.Field>
      {isContentEditable || !isDefaultValue ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={isProcessing}
          icon={<IconSave size='1.25rem' />}
          disabled={isDefaultValue}
        />
      ) : null}
    </form>
  );
}
