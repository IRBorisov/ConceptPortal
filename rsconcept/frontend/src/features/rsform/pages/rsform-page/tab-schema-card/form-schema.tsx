'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type CurrentVersion, LibraryItemType } from '@/domain/library';
import { type RSForm } from '@/domain/library/rsform';

import { useConceptNavigation } from '@/app';
import { schemaUpdateLibraryItem, type UpdateLibraryItemDTO } from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { SelectVersion } from '@/features/library/components/select-version';
import { ToolbarItemAccess } from '@/features/library/components/toolbar-item-access';

import { SubmitButton } from '@/components/control';
import { IconSave } from '@/components/icons';
import { Label, TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';
import { placeholderMsg } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { useSchemaEdit } from '../schema-edit-context';

import { ToolbarVersioning } from './toolbar-versioning';

interface FormSchemaProps {
  className?: string;
}

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

export function FormSchema({ className }: FormSchemaProps) {
  const router = useConceptNavigation();
  const { updateItem: updateSchema } = useUpdateItem();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const { schema, isContentEditable, isProcessing } = useSchemaEdit();

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
      className={cn('flex flex-col pt-1', className)}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <h2 className='mb-2 select-none'>Концептуальная схема</h2>
      <form.Field name='title'>
        {field => (
          <TextInput
            id='schema_title'
            aria-label='Название схемы'
            placeholder='Название схемы'
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
            disabled={!isContentEditable && schema.versions.length === 0}
            id='schema_version'
            className='select-none'
            value={schema.version}
            items={schema.versions}
            onChange={handleSelectVersion}
          />
        </div>
      </div>

      <div className='relative'>
        <ToolbarItemAccess
          className='absolute -top-1.5 right-2'
          visible={visible}
          toggleVisible={() => form.setFieldValue('visible', !visible)}
          readOnly={readOnly}
          toggleReadOnly={() => form.setFieldValue('read_only', !readOnly)}
          schema={schema}
          isProduced={schema.is_produced}
        />
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
              disabled={!isContentEditable || isProcessing}
            />
          )}
        </form.Field>
      </div>
      {isContentEditable || !isDefaultValue ? (
        <SubmitButton
          text='Сохранить изменения'
          titleHtml={prepareTooltip('Сохранить изменения', isMac() ? 'Cmd + S' : 'Ctrl + S')}
          className='self-center mt-4'
          loading={isProcessing}
          icon={<IconSave size='1.25rem' />}
          disabled={isDefaultValue}
        />
      ) : null}
    </form>
  );
}
