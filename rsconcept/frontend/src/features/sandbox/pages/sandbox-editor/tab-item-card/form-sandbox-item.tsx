'use client';

import { useEffect, useEffectEvent } from 'react';
import { useIntl } from 'react-intl';
import { useForm, useStore } from '@tanstack/react-form';

import { LibraryItemType, type RSModel } from '@/domain/library';
import { formatZodErrorMessage, useTx } from '@/i18n';

import { schemaUpdateLibraryItem, type UpdateLibraryItemDTO } from '@/features/library';
import { useModelEdit } from '@/features/rsmodel/pages/rsmodel-page/model-edit-context';
import { useSandboxBundle } from '@/features/sandbox/context/bundle-context';

import { SubmitButton } from '@/components/control';
import { IconDateCreate, IconDateUpdate, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { ValueIcon } from '@/components/view';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

interface FormSandboxItemProps {
  className?: string;
}

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

export function FormSandboxItem({ className }: FormSandboxItemProps) {
  const tx = useTx();
  const intl = useIntl();
  const { model } = useModelEdit();
  const { updateLibraryItem } = useSandboxBundle();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);

  const form = useForm({
    defaultValues: modelDefaults(model),
    validators: {
      onChange: schemaUpdateLibraryItem
    },
    onSubmit: ({ value, formApi }) => {
      updateLibraryItem(value);
      formApi.reset(value);
    }
  });

  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);
  const canSubmit = useStore(form.store, state => state.isValid);
  const onResetEvent = useEffectEvent((next: UpdateLibraryItemDTO) => form.reset(next));

  useEffect(
    function resetFormOnModelChange() {
      onResetEvent(modelDefaults(model));
    },
    [model]
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
      <h2 className='mb-2 select-none font-math'>{tx('ui.page.sandbox')}</h2>
      <form.Field name='title'>
        {field => (
          <TextInput
            id='sandbox_model_title'
            aria-label={tx('ui.field.rsmodelTitle')}
            placeholder={tx('ui.field.rsmodelTitle')}
            className='mb-3'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>

      <form.Field name='alias'>
        {field => (
          <TextInput
            dense
            id='sandbox_model_alias'
            label={tx('semantic.term.alias')}
            className='w-full mb-3'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>

      <form.Field name='description'>
        {field => (
          <TextArea
            id='sandbox_model_description'
            label={tx('semantic.term.description')}
            placeholder={tx('labels.placeholder.itemDescription')}
            rows={5}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>

      <div className='mt-3 sm:mb-1 flex justify-between items-center'>
        <ValueIcon
          title={tx('semantic.term.dateUpdated')}
          dense
          icon={<IconDateUpdate size='1.25rem' />}
          value={new Date(model.time_update).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          })}
        />

        <SubmitButton
          text={tx('semantic.action.save')}
          className='self-center w-40'
          loading={false}
          icon={<IconSave size='1.25rem' />}
          disabled={isDefaultValue || !canSubmit}
        />

        <ValueIcon
          title={tx('semantic.term.dateCreated')}
          dense
          icon={<IconDateCreate size='1.25rem' />}
          value={new Date(model.time_create).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          })}
        />
      </div>
    </form>
  );
}
