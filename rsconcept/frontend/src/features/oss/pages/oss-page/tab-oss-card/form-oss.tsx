'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';

import { useTx } from '@/i18n';
import { LibraryItemType } from '@rsconcept/domain/library';
import { type OperationSchema } from '@rsconcept/domain/library';

import { useRegisterUnsavedSave } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { schemaUpdateLibraryItem, type UpdateLibraryItemDTO } from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { ToolbarItemAccess } from '@/features/library/components/toolbar-item-access';
import { PassportTourID } from '@/features/onboarding/tours/editor-tours';

import { Button, SubmitButton } from '@/components/control';
import { IconReset, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';
import { isMac } from '@/utils/utils';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useOssEdit } from '../oss-edit-context';

interface FormOSSProps {
  className?: string;
}

function ossDefaults(schema: OperationSchema): UpdateLibraryItemDTO {
  return {
    id: schema.id,
    item_type: LibraryItemType.OSS,
    title: schema.title,
    alias: schema.alias,
    description: schema.description
  };
}

export function FormOSS({ className }: FormOSSProps) {
  const tx = useTx();
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

  const isDefaultValue = useSelector(form.store, state => state.isDefaultValue);
  useRegisterUnsavedSave(() => form.handleSubmit(), !isDefaultValue);

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

  function handleResetChanges() {
    form.reset(ossDefaults(schema));
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
      data-tour='passport-form'
    >
      <div className='mb-2 flex items-center gap-2'>
        <h2 className='select-none'>{tx('tx.oss.short')}</h2>
        <BadgeHelp topic={HelpTopic.UI_OSS_CARD} tourID={PassportTourID.OSS} offset={4} />
      </div>
      <form.Field name='title'>
        {field => (
          <TextInput
            id='schema_title'
            aria-label={tx('tx.lib.title')}
            placeholder={tx('tx.lib.title')}
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
              label={tx('tx.lib.alias')}
              className='w-64'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
              disabled={!isMutable}
            />
          )}
        </form.Field>
        <ToolbarItemAccess className='mt-6' schema={schema} isProduced={false} formDirty={!isDefaultValue} />
      </div>

      <form.Field name='description'>
        {field => (
          <TextArea
            id='schema_comment'
            label={tx('tx.lib.description')}
            placeholder={tx('tx.lib.description.hint')}
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
        <div className='w-full mt-4 flex justify-between gap-3'>
          <SubmitButton
            text={tx('tx.general.changes.save')}
            title={prepareTooltip(tx('tx.general.changes.save'), isMac() ? 'Cmd + S' : 'Ctrl + S')}
            loading={isProcessing}
            icon={<IconSave size='1.25rem' />}
            disabled={!isModified}
          />
          <Button
            text={tx('tx.general.changes.reset')}
            title={tx('tx.general.changes.reset')}
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={handleResetChanges}
            disabled={!isModified || isProcessing}
          />
        </div>
      ) : null}
    </form>
  );
}
